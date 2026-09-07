import ExcelJS from 'exceljs'
import { getFieldsForCategory, optionsForField } from '@/lib/comparison-fields'
import { BASE_COLUMNS } from './types'

interface CategoryRef {
  name: string
  slug: string
}

const TEMPLATE_ROWS = 500

export async function buildImportTemplate(categories: CategoryRef[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()

  for (const category of categories) {
    const ws = wb.addWorksheet(category.name.slice(0, 31)) // límite de Excel para nombres de hoja
    const fields = getFieldsForCategory(category.slug)
    const headers = [...BASE_COLUMNS, ...fields.map((f) => f.label)]

    ws.addRow(headers)
    ws.getRow(1).font = { bold: true }
    ws.views = [{ state: 'frozen', ySplit: 1 }]
    ws.columns.forEach((col) => { col.width = 22 })

    fields.forEach((field, i) => {
      if (field.type === 'text') return
      const options = optionsForField(field)
      const colNumber = BASE_COLUMNS.length + i + 1
      for (let row = 2; row <= TEMPLATE_ROWS; row++) {
        ws.getCell(row, colNumber).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${options.join(',')}"`],
          showErrorMessage: true,
          errorTitle: 'Valor no permitido',
          error: `Debes elegir uno de: ${options.join(', ')}`,
        }
      }
    })
  }

  const buffer = await wb.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
