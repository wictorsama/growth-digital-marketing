export class PhoneRecord {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly phone: string,
    public readonly state: string,
  ) {}

  static fromCsv(row: any): PhoneRecord {
    return new PhoneRecord(
      row.id,
      row.name,
      row.phone,
      row.state,
    );
  }

  public isValidPhone(): boolean {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(this.phone);
  }

  public isValidState(): boolean {
    const validStates = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];
    return validStates.includes(this.state);
  }
}