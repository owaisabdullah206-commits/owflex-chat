export class ParseError extends Error {
  constructor(
    public readonly code: 'SCANNED_PDF_ERROR' | 'ENCRYPTED_PDF_ERROR' | 'PARSE_FAILED',
    message: string,
  ) {
    super(message)
    this.name = 'ParseError'
  }
}

export async function extractText(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (
    mimeType === 'application/pdf' ||
    mimeType === 'application/x-pdf'
  ) {
    return extractPdfText(buffer)
  }

  if (
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return extractDocxText(buffer)
  }

  if (mimeType === 'text/csv' || mimeType === 'application/csv') {
    return extractCsvText(buffer)
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel'
  ) {
    return extractExcelText(buffer)
  }

  // TXT, MD, plain text — passthrough
  return buffer.toString('utf-8')
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const { extractText } = await import('unpdf')
    const { text } = await extractText(buffer, { mergePages: true })

    if (text.trim().length < 50) {
      throw new ParseError(
        'SCANNED_PDF_ERROR',
        'This PDF appears to be scanned (image-only). Scanned PDFs are not yet supported. Please upload a digitally-created PDF.',
      )
    }

    return text
  } catch (err) {
    if (err instanceof ParseError) throw err
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password')) {
      throw new ParseError(
        'ENCRYPTED_PDF_ERROR',
        'This PDF is password-protected. Please remove the password and re-upload.',
      )
    }
    throw new ParseError('PARSE_FAILED', `PDF parsing failed: ${msg}`)
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new ParseError('PARSE_FAILED', `DOCX parsing failed: ${msg}`)
  }
}

async function extractCsvText(buffer: Buffer): Promise<string> {
  try {
    const Papa = await import('papaparse')
    const { processCsvRows } = await import('@/lib/knowledge/csv-cleaner')
    const csv = buffer.toString('utf-8')
    const result = Papa.default.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true })
    return processCsvRows(result.data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new ParseError('PARSE_FAILED', `CSV parsing failed: ${msg}`)
  }
}

async function extractExcelText(buffer: Buffer): Promise<string> {
  try {
    const XLSX = await import('xlsx')
    const { processCsvRows } = await import('@/lib/knowledge/csv-cleaner')
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) return ''
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
    return processCsvRows(rows)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new ParseError('PARSE_FAILED', `Excel parsing failed: ${msg}`)
  }
}
