import PdfPrinter from 'pdfmake';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createInvoice = async (data) => {
	var fontDescriptors = {
		Roboto: {
			normal: path.join(
				__dirname,
				'..',
				'..',
				'Controllers/Fonts',
				'Roboto-Regular.ttf'
			),
			bold: path.join(
				__dirname,
				'..',
				'..',
				'Controllers/Fonts',
				'Roboto-Bold.ttf'
			),
			italics: path.join(
				__dirname,
				'..',
				'..',
				'Controllers/Fonts',
				'Roboto-Italic.ttf'
			),
			bolditalics: path.join(
				__dirname,
				'..',
				'..',
				'Controllers/Fonts',
				'Roboto-BoldItalic.ttf'
			),
		},
	};
	const {
		orderId,
		customerName,
		customerEmail,
		date,
		title,
		description,
		quantity,
		gatewayCharges,
		ogamount,
		tax,
		discount,
		total,
	} = data;

	function createCell(text) {
		return { text: text, margin: [0, 5, 0, 5] };
	}
	var dd = {
		content: [
			{
				image:
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARUAAACBCAYAAADubi4DAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAECWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI0LTAzLTE5PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPmNmYzZmY2JmLWVjMGItNGMwNi05NWJjLWNlYmFhOTYwYTMyNjwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5CbGFjayBXaGl0ZSBNaW5pbWFsaXN0IENvbm5lY3QgQ29ycG9yYXRlIExvZ28gLSAxPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6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', // Base64 encoded string or URL of your logo

				width: 200,
				margin: [-8, 0, 0, 7],
			},
			{
				text: 'Thankyou for your purchase',
				fontSize: 18,
				bold: true,
				alignment: 'left',
				margin: [0, 0, 0, 20],
			},
			{
				text: 'Billed By IGLoaded',
				fontSize: 14,
				bold: true,
				margin: [0, 0, 0, 5],
			},
			{
				text: `OrderId: #${orderId}`,
				fontSize: 12,
				bold: false,
				margin: [0, 0, 0, 2],
			},
			{
				text: `Date: ${date}`,
				fontSize: 12,
				bold: false,
				margin: [0, 0, 0, 20],
			},
			{
				text: 'Bill to:',
				fontSize: 14,
				bold: true,
				alignment: 'right',
				margin: [0, 0, 0, 5],
			},
			{
				text: customerName,
				fontSize: 12,
				bold: false,
				alignment: 'right',
				margin: [0, 0, 0, 2],
			},
			{
				alignment: 'right',
				text: customerEmail,
				fontSize: 12,
				margin: [0, 0, 0, 25],
			},
			{
				table: {
					widths: ['auto', 'auto', '*', '*', '*'],
					body: [
						[
							{ text: 'Title', lineHeight: 2.0 },
							'Description',
							'Price',
							'Quantity',
							'Total',
						],
						// Add your products here
						[
							createCell(title),
							createCell(description),
							createCell(ogamount),
							createCell(quantity),
							createCell(ogamount),
						],
						[
							createCell('Tax'),
							createCell(''),
							createCell(''),
							createCell(''),
							createCell(tax),
						],
						[
							createCell('PG Charges (3%)'),
							'',
							'',
							'',
							createCell(gatewayCharges),
						],
						[
							createCell('Discount'),
							'',
							'',
							'',
							createCell(discount),
						],
						[
							createCell('Total'),
							'',
							'',
							'',
							createCell(total),
						],
					],
				},
				layout: 'lightHorizontalLines', // optional
				margin: [0, 0, 0, 15],
			},
			{
				text:
					'This is an automated generated receipt of the purchase',
				fontSize: 12,
				bold: true,
				italics: true,
				margin: [0, 40, 0, 16],
			},
		],
	};
	var pdfBuffer;
	return new Promise((resolve, reject) => {
		try {
			const printer = new PdfPrinter(
				fontDescriptors
			);
			var pdfDoc = printer.createPdfKitDocument(dd);
			let chunks = [];
			pdfDoc.on('data', (chunk) => {
				chunks.push(chunk);
			});
			pdfDoc.on('end', () => {
				pdfBuffer = Buffer.concat(chunks);
				resolve({
					status: 200,
					message: 'PDF Created',
					bufferData: pdfBuffer,
				});
			});
			pdfDoc.end();
		} catch (error) {
			console.log(error);
			reject({
				status: 500,
				message: 'PDF Creation Failed',
				bufferData: null,
			});
		}
	});
};
