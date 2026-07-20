const XLSX = require('xlsx');

function buildReportXlsx(rows) {
  const data = rows.map(r => ({
    'N° Propuesta':     r.proposal_number,
    'Comercial':        r.commercial_name || '',
    'Lead':             r.lead_name || '',
    'Detalle':          r.lead_detail || '',
    'Email':            r.lead_email || '',
    'Paquete':          r.package || '',
    'Enviada':          r.status === 'sent' ? 'Sí' : 'No',
    'Fecha de envío':   r.sent_at ? new Date(r.sent_at).toLocaleDateString('es-AR') : '',
    'Leyó':             r.view_count > 0 ? 'Sí' : 'No',
    'Cantidad de vistas': r.view_count,
    'Última vista':     r.last_viewed_at ? new Date(r.last_viewed_at).toLocaleDateString('es-AR') : '',
    'Fecha de creación': r.created_at ? new Date(r.created_at).toLocaleDateString('es-AR') : '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 14 }, { wch: 18 }, { wch: 22 }, { wch: 28 }, { wch: 26 },
    { wch: 10 }, { wch: 9 }, { wch: 14 }, { wch: 7 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Propuestas LLC');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = { buildReportXlsx };
