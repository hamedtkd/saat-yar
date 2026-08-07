import QRCode from "./vendor/qrcode/index.cjs";
import QRErrorCorrectLevel from "./vendor/qrcode/QRErrorCorrectLevel.cjs";

export type QrMatrix = {
  size: number;
  cells: boolean[][];
};

export function createLocalQrMatrix(value: string): QrMatrix {
  if (!value) throw new Error("متن QR خالی است.");
  const qr = new QRCode(-1, QRErrorCorrectLevel.L);
  qr.addData(value);
  qr.make();
  const size = qr.getModuleCount() as number;
  const cells = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => Boolean(qr.isDark(row, column))),
  );
  return { size, cells };
}

export function createQrSvgPath(matrix: QrMatrix): string {
  const commands: string[] = [];
  for (let row = 0; row < matrix.size; row += 1) {
    for (let column = 0; column < matrix.size; column += 1) {
      if (matrix.cells[row]?.[column]) commands.push(`M${column} ${row}h1v1h-1z`);
    }
  }
  return commands.join("");
}
