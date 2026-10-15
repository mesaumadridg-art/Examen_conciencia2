package com.examenconciencia.app;

import com.examenconciencia.app.plugins.UpdateCheckerPlugin;
import com.getcapacitor.BridgeActivity;
import androidx.core.splashscreen.SplashScreen;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        
        // Registrar plugin personalizado
        registerPlugin(UpdateCheckerPlugin.class);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, android.content.Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        com.getcapacitor.PluginHandle handle = getBridge().getPlugin("UpdateChecker");
        if (handle != null) {
            com.getcapacitor.Plugin plugin = handle.getInstance();
            if (plugin instanceof UpdateCheckerPlugin) {
                ((UpdateCheckerPlugin) plugin).handleActivityResult(requestCode, resultCode, data);
            }
        }
    }
}