import { Plugin, WebPlugin } from '@capacitor/core';

export interface UpdateInfo {
  updateAvailable: boolean;
  currentVersionCode: number;
  currentVersionName: string;
  serverVersionCode: number;
  serverVersionName: string;
  changelog: string;
  force: boolean;
  apkUrl: string;
  skipped?: boolean;
}

export interface CurrentVersion {
  versionCode: number;
  versionName: string;
}

export interface CheckUpdateOptions {
  updateUrl: string;
  force?: boolean;
  silent?: boolean;
}

export interface DownloadOptions {
  apkUrl: string;
}

export interface SkipVersionOptions {
  versionCode: number;
}

export interface UpdateCheckerPlugin extends Plugin {
  checkForUpdate(options: CheckUpdateOptions): Promise<UpdateInfo>;
  downloadAndInstall(options: DownloadOptions): Promise<{ started: boolean }>;
  skipVersion(options: SkipVersionOptions): Promise<void>;
  getCurrentVersion(): Promise<CurrentVersion>;
}

declare global {
  interface Window {
    UpdateChecker?: UpdateCheckerPlugin;
  }
}