import { UpdateChecker, type UpdateInfo, type CheckUpdateOptions } from '../plugins';

const UPDATE_CHECK_KEY = 'examen_conciencia_update_check';

export interface UpdateCheckResult {
  hasUpdate: boolean;
  info: UpdateInfo | null;
  error: string | null;
}

export class UpdateService {
  private static instance: UpdateService;
  private updateUrl: string;

  private constructor() {
    // URL del JSON de actualizaciones en tu NAS
    // Ejemplo: http://192.168.1.100/examen-conciencia/update.json
    // O HTTPS si tienes certificado: https://nas.tu-dominio.com/examen-conciencia/update.json
    this.updateUrl = import.meta.env.VITE_UPDATE_URL || '';
  }

  static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  setUpdateUrl(url: string) {
    this.updateUrl = url;
  }

  async checkForUpdate(force = false, silent = false): Promise<UpdateCheckResult> {
    if (!this.updateUrl) {
      return { hasUpdate: false, info: null, error: 'Update URL not configured' };
    }

    try {
      const info = await UpdateChecker.checkForUpdate({
        updateUrl: this.updateUrl,
        force,
        silent,
      });

      return {
        hasUpdate: info.updateAvailable && !info.skipped,
        info,
        error: null,
      };
    } catch (error) {
      return {
        hasUpdate: false,
        info: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async downloadAndInstall(apkUrl: string): Promise<boolean> {
    try {
      await UpdateChecker.downloadAndInstall({ apkUrl });
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  }

  async skipVersion(versionCode: number): Promise<void> {
    await UpdateChecker.skipVersion({ versionCode });
  }

  async getCurrentVersion(): Promise<{ versionCode: number; versionName: string }> {
    return UpdateChecker.getCurrentVersion();
  }

  // Verifica automáticamente al iniciar la app (una vez por día)
  async autoCheckOnStart(): Promise<UpdateCheckResult | null> {
    const now = Date.now();
    const lastCheck = parseInt(localStorage.getItem(UPDATE_CHECK_KEY) || '0', 10);

    // Verificar solo una vez por día (86400000 ms)
    if (now - lastCheck < 86400000) {
      return null;
    }

    localStorage.setItem(UPDATE_CHECK_KEY, now.toString());
    return this.checkForUpdate(false, true);
  }
}

export const updateService = UpdateService.getInstance();