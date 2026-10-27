
const KEY = import.meta.env.VITE_API_KEY || '00000000-0000-0000-0000-000000000001';


const toQuery = (params) =>
  Object.entries({ key: KEY, ...params })
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('&');

async function request(params) {
  let res;
  try {
    res = await fetch(`/api/hs/hsprice/?${toQuery(params)}`);
  } catch {
    throw new Error('Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.');
  }
  if (!res.ok) throw new Error(`Сервер ответил ошибкой ${res.status}`);

  const data = await res.json();
  if (data.error) throw new Error(`Ошибка API: ${data.error}`);
  return data.goods || [];
}


export async function findBrands(number) {
  const goods = await request({ number });
  return goods.filter((item) => item.brand);
}


export async function findOffers(number, brand) {
  const goods = await request({ number, brand, analogues: 'on' });
  const main = goods[0];
  if (!main || !main.brand) return [];
  return [{ ...main, isRequested: true }, ...(main.analogues || [])];
}
