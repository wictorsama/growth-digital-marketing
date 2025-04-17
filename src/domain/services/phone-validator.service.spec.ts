import { Test, TestingModule } from '@nestjs/testing';
import { PhoneValidatorService } from './phone-validator.service';

describe('PhoneValidatorService', () => {
  let service: PhoneValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneValidatorService],
    }).compile();

    service = module.get<PhoneValidatorService>(PhoneValidatorService);
  });

  describe('isValid', () => {
    it('should validate correct phone numbers', () => {
      expect(service.isValid('(11) 98765-4321')).toBe(true);
      expect(service.isValid('(21) 99999-9999')).toBe(true);
    });

    it('should invalidate incorrect phone numbers', () => {
      expect(service.isValid('11987654321')).toBe(false);
      expect(service.isValid('(00) 98765-4321')).toBe(false);
    });
  });

  describe('getDDD', () => {
    it('should extract DDD correctly', () => {
      expect(service.getDDD('(11) 98765-4321')).toBe('11');
      expect(service.getDDD('(21) 99999-9999')).toBe('21');
    });

    it('should return empty string for invalid format', () => {
      expect(service.getDDD('11987654321')).toBe('');
    });
  });
});