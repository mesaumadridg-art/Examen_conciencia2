import { registerPlugin, WebPlugin } from '@capacitor/core';
import type { UpdateInfo, CheckUpdateOptions, DownloadOptions, SkipVersionOptions, CurrentVersion } from './definitions';

class UpdateCheckerWeb extends WebPlugin {
  async checkForUpdate(_options: CheckUpdateOptions): Promise<UpdateInfo> {
    console.warn('UpdateChecker: checkForUpdate not available on web');
    return {
      updateAvailable: false,
      currentVersionCode: 1,
      currentVersionName: '1.0.0',
      serverVersionCode: 1,
      serverVersionName: '1.0.0',
      changelog: '',
      force: false,
      apkUrl: '',
    };
  }

  async downloadAndInstall(_options: DownloadOptions): Promise<{ started: boolean }> {
    console.warn('UpdateChecker: downloadAndInstall not available on web');
    return { started: false };
  }

  async skipVersion(_options: SkipVersionOptions): Promise<void> {
    console.warn('UpdateChecker: skipVersion not available on web');
  }

  async getCurrentVersion(): Promise<CurrentVersion> {
    return { versionCode: 1, versionName: '1.0.0' };
  }
}

const UpdateChecker = registerPlugin<UpdateCheckerPlugin>('UpdateChecker', {
  web: () => new UpdateCheckerWeb(),
});

export { UpdateChecker };
export type { UpdateInfo, CheckUpdateOptions, DownloadOptions, SkipVersionOptions, CurrentVersion };