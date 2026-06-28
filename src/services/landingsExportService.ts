import type { Landing } from '@/types';

export function exportarLandingsJSON(landings: Landing[]): void {
  const data = {
    landings,
    exportadoEn: new Date().toISOString(),
    total: landings.length,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `landings-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importarLandingsJSON(
  file: File,
  onImport: (landings: Landing[]) => void
): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      if (data.landings && Array.isArray(data.landings)) {
        onImport(data.landings as Landing[]);
      } else {
        alert('Formato inválido: se espera un objeto con propiedad "landings".');
      }
    } catch {
      alert('Error al leer el archivo JSON.');
    }
  };
  reader.readAsText(file);
}
