/**
 * Table Component - Displayed Reservations
 * Core UI for Liste view (US-001)
 */

import type { Reservation, ReservationStatus } from '@/types'
import { SkeletonTable } from './Skeleton'
import { formatDate } from '@/utils'
import { getStatusColor, getStatusBgColor, getStatusIcon } from '@/utils'

interface TableProps {
  reservations: Reservation[]
  loading?: boolean
  onEdit?: (reservation: Reservation) => void
  onDelete?: (reservation: Reservation) => void
  onStatusChange?: (reservation: Reservation, newStatus: ReservationStatus) => void
}

export function ReservationTable({
  reservations,
  loading = false,
  onEdit,
  onDelete,
  onStatusChange,
}: TableProps) {
  if (loading) {
    return <SkeletonTable rows={5} columns={7} />
  }

  const statusOptions: ReservationStatus[] = [
    'En attente',
    'Confirmée',
    'Annulée',
    'Terminée',
    'No-show',
  ]

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#f3f4f6',
              borderBottom: '2px solid #e5e7eb',
            }}
          >
            <th style={headerCellStyle}>Nom</th>
            <th style={headerCellStyle}>Date</th>
            <th style={headerCellStyle}>Heure</th>
            <th style={headerCellStyle}>Nb pers.</th>
            <th style={headerCellStyle}>Statut</th>
            <th style={headerCellStyle}>Infos</th>
            <th style={headerCellStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res) => (
            <tr
              key={res.id}
              style={{
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: res.createdTime?.includes(new Date().toISOString().split('T')[0])
                  ? '#fffbeb'
                  : 'white',
              }}
            >
              <td style={{ ...cellStyle, fontWeight: '500' }}>{`${res.prenom} ${res.nomComplet}`}</td>
              <td style={cellStyle}>{formatDate(res.date)}</td>
              <td style={cellStyle}>{res.heure}</td>
              <td style={cellStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '50%',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {res.nbPersonnes}
                </div>
              </td>
              <td style={cellStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{getStatusIcon(res.statut)}</span>
                  {onStatusChange ? (
                    <select
                      value={res.statut}
                      onChange={(e) =>
                        onStatusChange(res, e.target.value as ReservationStatus)
                      }
                      style={{
                        padding: '2px 4px',
                        fontSize: '12px',
                        border: `1px solid ${getStatusColor(res.statut)}`,
                        backgroundColor: getStatusBgColor(res.statut),
                        color: getStatusColor(res.statut),
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: getStatusBgColor(res.statut),
                        color: getStatusColor(res.statut),
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {res.statut}
                    </span>
                  )}
                </div>
              </td>
              <td
                style={{
                  ...cellStyle,
                  fontSize: '12px',
                  color: '#6B7280',
                  maxWidth: '100px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {res.autresInfos || '-'}
              </td>
              <td style={cellStyle}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(res)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#2563EB',
                        color: 'white',
                        border: 'none',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(res)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#DC2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const headerCellStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#374151',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const cellStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  verticalAlign: 'middle',
}
