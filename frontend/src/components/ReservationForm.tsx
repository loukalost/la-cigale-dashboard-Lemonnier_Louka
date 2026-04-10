/**
 * Reservation Form Component
 * Create/Edit form modal
 */

import { useState } from 'react'
import type { Reservation, CreateReservationDTO, UpdateReservationDTO, ReservationStatus } from '@/types'
import { VALID_TIME_SLOTS } from '@/utils'

interface FormProps {
  initialData?: Reservation
  onSubmit: (data: CreateReservationDTO | UpdateReservationDTO) => void
  onCancel: () => void
  loading?: boolean
}

export function ReservationForm({ initialData, onSubmit, onCancel, loading = false }: FormProps) {
  const [formData, setFormData] = useState({
    prenom: initialData?.prenom || '',
    nomComplet: initialData?.nomComplet || '',
    date: initialData?.date || '',
    heure: initialData?.heure || '',
    nbPersonnes: initialData?.nbPersonnes || 1,
    autresInfos: initialData?.autresInfos || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est obligatoire'
    if (!formData.nomComplet.trim()) newErrors.nomComplet = 'Le nom est obligatoire'
    if (!formData.date) newErrors.date = 'La date est obligatoire'
    if (!formData.heure) newErrors.heure = 'L\'heure est obligatoire'
    if (formData.nbPersonnes < 1 || formData.nbPersonnes > 12) {
      newErrors.nbPersonnes = 'Entre 1 et 12 personnes'
    }
    if (!VALID_TIME_SLOTS.includes(formData.heure)) {
      newErrors.heure = 'Créneau invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      prenom: formData.prenom,
      nomComplet: formData.nomComplet,
      date: formData.date,
      heure: formData.heure,
      nbPersonnes: formData.nbPersonnes,
      autresInfos: formData.autresInfos || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
        {initialData ? 'Éditer réservation' : 'Nouvelle réservation'}
      </h2>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Prénom *</label>
        <input
          type="text"
          value={formData.prenom}
          onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
          placeholder="ex: Jean"
          style={inputStyle}
          disabled={loading}
        />
        {errors.prenom && <span style={errorStyle}>{errors.prenom}</span>}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Nom complet *</label>
        <input
          type="text"
          value={formData.nomComplet}
          onChange={(e) => setFormData({ ...formData, nomComplet: e.target.value })}
          placeholder="ex: Dupont"
          style={inputStyle}
          disabled={loading}
        />
        {errors.nomComplet && <span style={errorStyle}>{errors.nomComplet}</span>}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Date *</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          style={inputStyle}
          disabled={loading}
        />
        {errors.date && <span style={errorStyle}>{errors.date}</span>}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Heure *</label>
        <select
          value={formData.heure}
          onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
          style={inputStyle}
          disabled={loading}
        >
          <option value="">-- Sélectionner --</option>
          <optgroup label="Midi">
            {VALID_TIME_SLOTS.filter((t) => t < '19:00').map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </optgroup>
          <optgroup label="Soir">
            {VALID_TIME_SLOTS.filter((t) => t >= '19:00').map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </optgroup>
        </select>
        {errors.heure && <span style={errorStyle}>{errors.heure}</span>}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Nombre de personnes *</label>
        <input
          type="number"
          value={formData.nbPersonnes}
          onChange={(e) => setFormData({ ...formData, nbPersonnes: Number(e.target.value) })}
          min="1"
          max="12"
          style={inputStyle}
          disabled={loading}
        />
        {errors.nbPersonnes && <span style={errorStyle}>{errors.nbPersonnes}</span>}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Infos complémentaires</label>
        <textarea
          value={formData.autresInfos}
          onChange={(e) => setFormData({ ...formData, autresInfos: e.target.value })}
          placeholder="Allergies, demandes spéciales..."
          maxLength={200}
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' } as React.CSSProperties}
          disabled={loading}
        />
        <div style={{ fontSize: '12px', color: '#6B7280' }}>
          {formData.autresInfos.length}/200
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={secondaryButtonStyle}
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="submit"
          style={primaryButtonStyle}
          disabled={loading}
        >
          {loading ? 'Traitement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

const formStyle: React.CSSProperties = {
  padding: '24px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  marginBottom: '6px',
  color: '#374151',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontFamily: 'inherit',
}

const errorStyle: React.CSSProperties = {
  display: 'block',
  color: '#dc2626',
  fontSize: '12px',
  marginTop: '4px',
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#2563EB',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
}

const secondaryButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#e5e7eb',
  color: '#374151',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
}
