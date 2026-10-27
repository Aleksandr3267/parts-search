import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands, fetchOffers } from './searchSlice';

const formatPrice = (value) =>
  value == null
    ? '—'
    : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value);


function bestPrice(item) {
  const prices = (item.warehouses || []).filter((w) => w.stock > 0).map((w) => w.price);
  return prices.length ? Math.min(...prices) : null;
}

function Loader() {
  return (
    <div className="text-center py-4">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Загрузка…</span>
      </div>
    </div>
  );
}


function Result({ block, emptyText, children }) {
  if (block.status === 'loading') return <Loader />;
  if (block.status === 'error') return <div className="alert alert-danger">{block.error}</div>;
  if (block.status === 'done' && block.items.length === 0)
    return <div className="alert alert-warning">{emptyText}</div>;
  if (block.status === 'done') return children;
  return null;
}

function SearchForm({ onSearch, disabled }) {
  const [value, setValue] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const number = value.trim();
    if (number) onSearch(number);
  };

  return (
    <form className="input-group mb-4" onSubmit={submit}>
      <input
        className="form-control"
        placeholder="Артикул, например 01089"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="btn btn-primary" disabled={disabled || !value.trim()}>
        Найти
      </button>
    </form>
  );
}

function BrandList({ items, selectedId, onSelect }) {
  return (
    <div className="list-group mb-4">
      {items.map((item) => (
        <button
          key={item.goodsID}
          className={`list-group-item list-group-item-action ${
            item.goodsID === selectedId ? 'active' : ''
          }`}
          onClick={() => onSelect(item)}
        >
          <strong>{item.brand}</strong> — {item.name} ({item.number})
        </button>
      ))}
    </div>
  );
}

function OffersTable({ items }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead>
          <tr>
            <th>Название / Производитель</th>
            <th>Артикул</th>
            <th className="text-end">Цена</th>
            <th className="text-end">Остаток</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.goodsID} className={item.isRequested ? 'table-primary' : ''}>
              <td>
                {item.name}
                <div className="text-muted small">
                  {item.brand}
                  {item.isRequested ? ' · искомая деталь' : ' · аналог'}
                </div>
              </td>
              <td>{item.number}</td>
              <td className="text-end">{formatPrice(bestPrice(item))}</td>
              <td className="text-end">{item.count} шт.</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { brands, offers, selectedId } = useSelector((state) => state.search);

  const selectBrand = (item) =>
    dispatch(fetchOffers({ number: item.number, brand: item.brand, goodsID: item.goodsID }));

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <h1 className="h3 mb-4">Поиск автозапчастей</h1>

      <SearchForm
        onSearch={(number) => dispatch(fetchBrands(number))}
        disabled={brands.status === 'loading'}
      />

      <Result block={brands} emptyText="Деталь с таким артикулом не найдена.">
        <h2 className="h5">Выберите производителя</h2>
        <BrandList items={brands.items} selectedId={selectedId} onSelect={selectBrand} />
      </Result>

      <Result block={offers} emptyText="Предложений по этой детали нет.">
        <h2 className="h5">Аналоги и предложения</h2>
        <OffersTable items={offers.items} />
      </Result>
    </div>
  );
}
