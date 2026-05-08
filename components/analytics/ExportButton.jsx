'use client'

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ExportButton({ data, workspaceName = 'Workspace' }) {
  const [loading, setLoading] = useState(false)

  const exportCSV = () => {
    try {
      setLoading(true)

      const rows = []

      // Header
      rows.push(['FlowDesk Analytics Report'])
      rows.push([`Workspace: ${workspaceName}`])
      rows.push([`Generated: ${formatDate(new Date(), 'MMM d, yyyy h:mm a')}`])
      rows.push([])

      // Overview stats
      rows.push(['OVERVIEW'])
      rows.push(['Metric', 'Value'])
      rows.push(['Completed Tasks',  data?.completedTasks  ?? '—'])
      rows.push(['Overdue Tasks',    data?.overdueTasks    ?? '—'])
      rows.push(['Active Projects',  data?.activeProjects  ?? '—'])
      rows.push(['Hours Tracked',    data?.hoursTracked    ?? '—'])
      rows.push([])

      // Completion trend
      if (data?.completionTrend?.length) {
        rows.push(['COMPLETION TREND'])
        rows.push(['Date', 'Completed', 'Created'])
        data.completionTrend.forEach((item) => {
          rows.push([item.date || item.label, item.completed, item.created])
        })
        rows.push([])
      }

      // Team performance
      if (data?.teamPerformance?.length) {
        rows.push(['TEAM PERFORMANCE'])
        rows.push(['Member', 'Completed', 'In Progress', 'Overdue'])
        data.teamPerformance.forEach((item) => {
          rows.push([item.name, item.completed, item.inProgress, item.overdue])
        })
        rows.push([])
      }

      // Convert to CSV string
      const csv = rows
        .map((row) =>
          row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
        )
        .join('\n')

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `flowdesk-analytics-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`
      link.click()
      URL.revokeObjectURL(url)

      toast.success('CSV exported successfully')
    } catch {
      toast.error('Failed to export CSV')
    } finally {
      setLoading(false)
    }
  }

  const exportPDF = async () => {
    try {
      setLoading(true)
      const { default: jsPDF }      = await import('jspdf')
      const { default: autoTable }  = await import('jspdf-autotable')

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      // Title
      doc.setFontSize(20)
      doc.setTextColor(45, 90, 255)
      doc.text('FlowDesk Analytics Report', 14, 20)

      // Meta
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Workspace: ${workspaceName}`, 14, 30)
      doc.text(`Generated: ${formatDate(new Date(), 'MMM d, yyyy h:mm a')}`, 14, 36)

      // Divider
      doc.setDrawColor(229, 231, 235)
      doc.line(14, 40, pageWidth - 14, 40)

      // Overview table
      autoTable(doc, {
        startY: 46,
        head:   [['Metric', 'Value']],
        body:   [
          ['Completed Tasks', data?.completedTasks  ?? '—'],
          ['Overdue Tasks',   data?.overdueTasks    ?? '—'],
          ['Active Projects', data?.activeProjects  ?? '—'],
          ['Hours Tracked',   data?.hoursTracked    ?? '—'],
        ],
        headStyles: {
          fillColor:  [45, 90, 255],
          textColor:  255,
          fontStyle:  'bold',
          fontSize:   10,
        },
        bodyStyles:       { fontSize: 10 },
        alternateRowStyles: { fillColor: [248, 249, 252] },
        margin: { left: 14, right: 14 },
      })

      // Completion trend table
      if (data?.completionTrend?.length) {
        const prevY = doc.lastAutoTable.finalY + 10
        doc.setFontSize(12)
        doc.setTextColor(30, 30, 30)
        doc.text('Completion Trend', 14, prevY)

        autoTable(doc, {
          startY: prevY + 4,
          head:   [['Date', 'Completed', 'Created']],
          body:   data.completionTrend.map((item) => [
            item.date || item.label,
            item.completed,
            item.created,
          ]),
          headStyles: {
            fillColor: [45, 90, 255],
            textColor: 255,
            fontSize:  10,
          },
          bodyStyles:           { fontSize: 10 },
          alternateRowStyles:   { fillColor: [248, 249, 252] },
          margin: { left: 14, right: 14 },
        })
      }

      // Team performance table
      if (data?.teamPerformance?.length) {
        const prevY = doc.lastAutoTable.finalY + 10
        doc.setFontSize(12)
        doc.setTextColor(30, 30, 30)
        doc.text('Team Performance', 14, prevY)

        autoTable(doc, {
          startY: prevY + 4,
          head:   [['Member', 'Completed', 'In Progress', 'Overdue']],
          body:   data.teamPerformance.map((item) => [
            item.name,
            item.completed,
            item.inProgress,
            item.overdue,
          ]),
          headStyles: {
            fillColor: [45, 90, 255],
            textColor: 255,
            fontSize:  10,
          },
          bodyStyles:           { fontSize: 10 },
          alternateRowStyles:   { fillColor: [248, 249, 252] },
          margin: { left: 14, right: 14 },
        })
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(160, 160, 160)
        doc.text(
          `FlowDesk · Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        )
      }

      doc.save(`flowdesk-analytics-${formatDate(new Date(), 'yyyy-MM-dd')}.pdf`)
      toast.success('PDF exported successfully')
    } catch {
      toast.error('Failed to export PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dropdown
      align="right"
      trigger={
        <button
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-surface-700 transition-all disabled:opacity-50"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <Download size={15} />
          }
          Export
          <ChevronDown size={13} className="text-gray-400" />
        </button>
      }
    >
      <DropdownItem
        icon={<FileSpreadsheet size={14} />}
        onClick={exportCSV}
      >
        Export as CSV
      </DropdownItem>
      <DropdownItem
        icon={<FileText size={14} />}
        onClick={exportPDF}
      >
        Export as PDF
      </DropdownItem>
    </Dropdown>
  )
}