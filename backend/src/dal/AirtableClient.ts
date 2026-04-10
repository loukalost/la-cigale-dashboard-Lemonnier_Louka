/**
 * Airtable Client
 * Low-level API interaction
 */

import { config } from '../server.js'
import type { Reservation } from '@/types'

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0'

interface AirtableRecord {
  id: string
  createdTime: string
  fields: {
    [key: string]: any
  }
}

export class AirtableClient {
  private apiKey: string
  private baseId: string
  private tableName: string

  constructor() {
    if (!config.airtableApiKey || !config.airtableBaseId) {
      throw new Error('Missing Airtable credentials in env vars')
    }
    this.apiKey = config.airtableApiKey
    this.baseId = config.airtableBaseId
    this.tableName = config.airtableTableName
  }

  private async request(method: string, endpoint: string, body?: any): Promise<any> {
    const url = `${AIRTABLE_API_BASE}/${this.baseId}/${endpoint}`

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      const errorMsg = (error as any).error?.message || 'Unknown error'
      throw new Error(`Airtable API (${response.status}): ${errorMsg}`)
    }

    return response.json()
  }

  async getAllRecords(): Promise<AirtableRecord[]> {
    try {
      const response = await this.request('GET', `${encodeURIComponent(this.tableName)}`)
      return response.records || []
    } catch (err) {
      console.error('[AirtableClient] getAllRecords error:', err)
      throw err
    }
  }

  async getRecord(recordId: string): Promise<AirtableRecord | null> {
    try {
      const response = await this.request('GET', `${encodeURIComponent(this.tableName)}/${recordId}`)
      return response
    } catch (err) {
      if ((err as any).message?.includes('404')) return null
      throw err
    }
  }

  async createRecord(fields: any): Promise<AirtableRecord> {
    try {
      const response = await this.request('POST', encodeURIComponent(this.tableName), {
        records: [
          {
            fields,
          },
        ],
      })
      return response.records[0]
    } catch (err) {
      console.error('[AirtableClient] createRecord error:', err)
      throw err
    }
  }

  async updateRecord(recordId: string, fields: any): Promise<AirtableRecord> {
    try {
      const response = await this.request('PATCH', encodeURIComponent(this.tableName), {
        records: [
          {
            id: recordId,
            fields,
          },
        ],
      })
      return response.records[0]
    } catch (err) {
      console.error('[AirtableClient] updateRecord error:', err)
      throw err
    }
  }

  async deleteRecord(recordId: string): Promise<void> {
    try {
      await this.request('DELETE', `${encodeURIComponent(this.tableName)}/${recordId}`)
    } catch (err) {
      console.error('[AirtableClient] deleteRecord error:', err)
      throw err
    }
  }

  /**
   * Map Airtable fields to Reservation DTO
   */
  static mapToReservation(record: AirtableRecord): Reservation {
    const { fields, id, createdTime } = record
    return {
      id,
      nomComplet: fields['Nom complet'] || '',
      prenom: fields['Prénom'] || '',
      date: fields['Date'] || '',
      heure: fields['Heure'] || '',
      nbPersonnes: fields['Nb personnes'] || 1,
      statut: fields['Statut'] || 'En attente',
      autresInfos: fields['Autres infos'],
      createdTime,
    }
  }

  /**
   * Map Reservation DTO to Airtable fields
   */
  static mapFromReservation(dto: any) {
    return {
      'Nom complet': dto.nomComplet,
      'Prénom': dto.prenom,
      'Date': dto.date,
      'Heure': dto.heure,
      'Nb personnes': dto.nbPersonnes,
      'Statut': dto.statut || 'En attente',
      'Autres infos': dto.autresInfos,
    }
  }
}
