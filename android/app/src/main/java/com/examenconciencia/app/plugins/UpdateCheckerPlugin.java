package com.examenconciencia.app.plugins;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.util.Log;
import android.webkit.MimeTypeMap;

import androidx.annotation.NonNull;
import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "UpdateChecker")
public class UpdateCheckerPlugin extends Plugin {

    private static final String TAG = "UpdateCheckerPlugin";
    private static final String PREF_NAME = "update_checker_prefs";
    private static final String KEY_LAST_CHECK = "last_check_time";
    private static final String KEY_SKIPPED_VERSION = "skipped_version_code";

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private DownloadManager downloadManager;
    private long downloadId = -1;
    private BroadcastReceiver downloadReceiver;
    private PluginCall pendingInstallCall;

    @Override
    public void load() {
        super.load();
        downloadManager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
        registerDownloadReceiver();
    }

    private void registerDownloadReceiver() {
        if (downloadReceiver == null) {
            downloadReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                    if (id == downloadId) {
                        handleDownloadComplete(context);
                    }
                }
            };
            IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
            getContext().registerReceiver(downloadReceiver, filter);
        }
    }

    private android.content.SharedPreferences getSharedPrefs() {
        return getContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    @PluginMethod
    public void checkForUpdate(PluginCall call) {
        String updateUrl = call.getString("updateUrl");
        boolean force = call.getBoolean("force", false);
        boolean silent = call.getBoolean("silent", false);

        if (updateUrl == null || updateUrl.isEmpty()) {
            call.reject("updateUrl is required");
            return;
        }

        executor.execute(() -> {
            try {
                JSONObject updateInfo = fetchUpdateInfo(updateUrl);
                int currentVersionCode = getCurrentVersionCode();
                int serverVersionCode = updateInfo.getInt("versionCode");
                String serverVersionName = updateInfo.getString("versionName");
                String apkUrl = updateInfo.getString("url");
                String changelog = updateInfo.optString("changelog", "");
                boolean serverForce = updateInfo.optBoolean("force", false);

                boolean updateAvailable = serverVersionCode > currentVersionCode;
                boolean shouldForce = force || serverForce;

                JSObject result = new JSObject();
                result.put("updateAvailable", updateAvailable);
                result.put("currentVersionCode", currentVersionCode);
                result.put("currentVersionName", getCurrentVersionName());
                result.put("serverVersionCode", serverVersionCode);
                result.put("serverVersionName", serverVersionName);
                result.put("changelog", changelog);
                result.put("force", shouldForce);
                result.put("apkUrl", apkUrl);

                if (updateAvailable) {
                    int skippedVersion = getSharedPrefs().getInt(KEY_SKIPPED_VERSION, -1);
                    if (!shouldForce && skippedVersion == serverVersionCode) {
                        result.put("updateAvailable", false);
                        result.put("skipped", true);
                    }
                }

                call.resolve(result);

            } catch (Exception e) {
                Log.e(TAG, "Error checking for update", e);
                call.reject("Failed to check for update: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String apkUrl = call.getString("apkUrl");
        if (apkUrl == null || apkUrl.isEmpty()) {
            call.reject("apkUrl is required");
            return;
        }

        pendingInstallCall = call;

        executor.execute(() -> {
            try {
                startDownload(apkUrl);
                call.resolve(new JSObject().put("started", true));
            } catch (Exception e) {
                Log.e(TAG, "Error starting download", e);
                call.reject("Failed to start download: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void skipVersion(PluginCall call) {
        int versionCode = call.getInt("versionCode", -1);
        if (versionCode > 0) {
            getSharedPrefs().edit().putInt(KEY_SKIPPED_VERSION, versionCode).apply();
        }
        call.resolve();
    }

    @PluginMethod
    public void getCurrentVersion(PluginCall call) {
        JSObject result = new JSObject();
        result.put("versionCode", getCurrentVersionCode());
        result.put("versionName", getCurrentVersionName());
        call.resolve(result);
    }

    private JSONObject fetchUpdateInfo(String updateUrl) throws IOException, JSONException {
        URL url = new URL(updateUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(10000);
        conn.setRequestProperty("User-Agent", "ExamenConciencia/" + getCurrentVersionName());

        if (conn.getResponseCode() != HttpURLConnection.HTTP_OK) {
            throw new IOException("HTTP " + conn.getResponseCode());
        }

        java.util.Scanner scanner = new java.util.Scanner(conn.getInputStream()).useDelimiter("\\A");
        String response = scanner.hasNext() ? scanner.next() : "";
        scanner.close();
        conn.disconnect();

        return new JSONObject(response);
    }

    private int getCurrentVersionCode() {
        try {
            PackageInfo pInfo = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            return (int) pInfo.getLongVersionCode();
        } catch (PackageManager.NameNotFoundException e) {
            return 1;
        }
    }

    private String getCurrentVersionName() {
        try {
            PackageInfo pInfo = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            return pInfo.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            return "1.0.0";
        }
    }

    private void startDownload(String apkUrl) {
        Activity activity = getActivity();
        if (activity == null) return;

        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(apkUrl));
        request.setTitle("Actualizando Examen de Conciencia");
        request.setDescription("Descargando nueva versión...");
        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "ExamenConciencia_update.apk");
        request.setMimeType("application/vnd.android.package-archive");
        request.allowScanningByMediaScanner();
        request.setVisibleInDownloadsUi(true);

        downloadId = downloadManager.enqueue(request);
    }

    private void handleDownloadComplete(Context context) {
        DownloadManager.Query query = new DownloadManager.Query();
        query.setFilterById(downloadId);

        try (android.database.Cursor cursor = downloadManager.query(query)) {
            if (cursor != null && cursor.moveToFirst()) {
                int statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
                int uriIndex = cursor.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI);

                if (statusIndex >= 0 && cursor.getInt(statusIndex) == DownloadManager.STATUS_SUCCESSFUL) {
                    if (uriIndex >= 0) {
                        String localUri = cursor.getString(uriIndex);
                        if (localUri != null) {
                            installApk(context, Uri.parse(localUri));
                        }
                    }
                } else {
                    if (pendingInstallCall != null) {
                        pendingInstallCall.reject("Download failed");
                        pendingInstallCall = null;
                    }
                }
            }
        }
    }

    private void installApk(Context context, Uri apkUri) {
        Activity activity = getActivity();
        if (activity == null) return;

        Intent intent = new Intent(Intent.ACTION_INSTALL_PACKAGE);
        intent.setData(apkUri);
        intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.putExtra(Intent.EXTRA_RETURN_RESULT, true);
        intent.putExtra(Intent.EXTRA_INSTALLER_PACKAGE_NAME, context.getPackageName());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            boolean canInstall = context.getPackageManager().canRequestPackageInstalls();
            if (!canInstall) {
                // Request permission to install unknown apps
                Intent settingsIntent = new Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                settingsIntent.setData(Uri.parse("package:" + context.getPackageName()));
                activity.startActivity(settingsIntent);
                if (pendingInstallCall != null) {
                    pendingInstallCall.reject("Unknown sources permission required");
                    pendingInstallCall = null;
                }
                return;
            }
        }

        activity.startActivityForResult(intent, 12345);
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (downloadReceiver != null) {
            try {
                getContext().unregisterReceiver(downloadReceiver);
            } catch (Exception e) {
                // Ignore
            }
        }
        executor.shutdown();
    }

    public void handleActivityResult(int requestCode, int resultCode, android.content.Intent data) {
        if (requestCode == 12345 && pendingInstallCall != null) {
            if (resultCode == Activity.RESULT_OK) {
                pendingInstallCall.resolve(new JSObject().put("installed", true));
            } else {
                pendingInstallCall.reject("Install cancelled or failed");
            }
            pendingInstallCall = null;
        }
    }
}