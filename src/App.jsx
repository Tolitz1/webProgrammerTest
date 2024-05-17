import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    fetch('https://livefeed3.chartnexus.com/Dummy/quotes?market_id=0&list=0')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched data:', data);
        if (Array.isArray(data)) {
          setData(data);
          setFlash(true);
        } else {
          console.error('Data is not an array:', data);
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFlash(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [flash]);
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.key === 'percentageChange') {
      const percentageChangeA = ((a.last - a.previous) / a.previous * 100);
      const percentageChangeB = ((b.last - b.previous) / b.previous * 100);
      if (percentageChangeA < percentageChangeB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (percentageChangeA > percentageChangeB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    } else {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    }
  });
  return (
    <>
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr className='buttons'>
              <th>
                <button onClick={() => handleSort('stockcode')}>Top <br /> Volume</button>
              </th>
              <th>
                <button onClick={() => handleSort('volume')}>Top <br /> Gainers</button>
              </th>
              <th>
                <button onClick={() => handleSort('percentageChange')}>Top <br /> Losers</button>
              </th>
              <th>
                <button onClick={() => handleSort('buy_volume')}>Top <br /> %Gainer</button>
              </th>
              <th>
                <button onClick={() => handleSort('sell_volume')}>Top <br /> %Loser</button>
              </th>
            </tr>
            <tr>
              <th>Stock <br /> Code</th>
              <th>Last <br /> Vol</th>
              <th>+/- <br /> %Chng</th>
              <th>Buy <br /> Volume</th>
              <th>Sell <br /> Volume</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((item, index) => {
                const percentageChange = ((item.last - item.previous) / item.previous * 100).toFixed(2);
                const colorChange = value => {
                  return value < 0 ? 'red' : 'green';
                };
                return (
                  <tr key={index}>
                    <td className={flash ? 'flashing' : ''}>
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div>{item.stockcode}</div>
                    </td>
                    <td className={flash ? 'flashing' : ''} style={{ color: colorChange(item.last - item.previous) }}>
                      <div>{item.last}</div>
                      <div>{item.volume}</div>
                    </td>
                    <td className={flash ? 'flashing' : ''} style={{ color: ((item.last - item.previous) / item.previous < 0) ? 'red' : 'green' }}>
                      <div>{(item.last - item.previous).toFixed(2)}</div>
                      <div>{((item.last - item.previous) / item.previous * 100).toFixed(2)}%</div>
                    </td>
                    <td className={flash ? 'flashing' : ''}>
                      <div>{item.volume}</div>
                      <div>{item.buy_volume}</div>
                    </td>
                    <td className={flash ? 'flashing' : ''}>
                      <div>{item.sell_price}</div>
                      <div>{item.sell_volume}</div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;
