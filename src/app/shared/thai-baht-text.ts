export function toThaiBahtText(amount: number): string {
  amount = Number(amount || 0);

  if (amount <= 0) return 'ศูนย์บาทถ้วน';

  const numberText = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const positionText = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

  const convertLessThanMillion = (num: string): string => {
    let result = '';
    const len = num.length;

    for (let i = 0; i < len; i++) {
      const digit = Number(num[i]);
      const pos = len - i - 1;

      if (digit === 0) continue;

      if (pos === 0) {
        result += digit === 1 && len > 1 ? 'เอ็ด' : numberText[digit];
      } else if (pos === 1) {
        if (digit === 1) result += 'สิบ';
        else if (digit === 2) result += 'ยี่สิบ';
        else result += numberText[digit] + 'สิบ';
      } else {
        result += numberText[digit] + positionText[pos];
      }
    }

    return result;
  };

  const convert = (num: string): string => {
    num = String(Number(num));

    if (num === '0') return '';

    if (num.length > 6) {
      const millionPart = num.slice(0, -6);
      const restPart = num.slice(-6);

      return convertLessThanMillion(millionPart) + 'ล้าน' + convertLessThanMillion(restPart);
    }

    return convertLessThanMillion(num);
  };

  const fixed = amount.toFixed(2);
  const [baht, satang] = fixed.split('.');

  const bahtText = convert(baht);

  if (satang === '00') {
    return `${bahtText}บาทถ้วน`;
  }

  return `${bahtText}บาท${convertLessThanMillion(satang)}สตางค์`;
}
