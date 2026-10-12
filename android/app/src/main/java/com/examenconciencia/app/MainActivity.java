package com.examenconciencia.app;

import com.examenconciencia.app.plugins.UpdateCheckerPlugin;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.Arrays;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(UpdateCheckerPlugin.class);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, android.content.Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        // Forward to UpdateCheckerPlugin
        com.getcapacitor.PluginHandle handle = getBridge().getPlugin("UpdateChecker");
        if (handle != null) {
            Plugin plugin = handle.getInstance();
            if (plugin instanceof UpdateCheckerPlugin) {
                ((UpdateCheckerPlugin) plugin).handleActivityResult(requestCode, resultCode, data);
            }
        }
    }
}
