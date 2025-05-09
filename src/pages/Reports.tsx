import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const summaryData = [
  { label: 'Accounts Uplifted', value: 36 },
  { label: 'Incremental MRR', value: '$2,126.35' },
  { label: 'Churned Accounts', value: 3 }
];

const chartData = {
  labels: ['5/31/2023', '6/1/2023'],
  datasets: [
    {
      label: 'No Increase Projected GRR',
      data: [8214.37, 0],
      backgroundColor: '#ffc107',
      borderColor: '#ffc107',
      borderWidth: 1
    },
    {
      label: 'MRR Post Renewal',
      data: [9448.39, 1414.91],
      backgroundColor: '#fff',
      borderColor: '#ccc',
      borderWidth: 1
    },
    {
      label: 'MRR After Renewal',
      data: [10448.39, 1399.00],
      backgroundColor: '#28808f',
      borderColor: '#28808f',
      borderWidth: 1
    }
  ]
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { color: '#fff' }
    },
    title: {
      display: false
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.1)' },
      ticks: { color: '#fff' }
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.1)' },
      ticks: { color: '#fff' }
    }
  }
};

// List of random account names
const randomAccountNames = [
  'Acme Corp', 'Globex Inc', 'Initech', 'Umbrella Corp', 'Hooli', 'Stark Industries', 'Wayne Enterprises',
  'Wonka Industries', 'Soylent Corp', 'Cyberdyne Systems', 'Tyrell Corp', 'Gringotts Bank', 'Oscorp',
  'Pied Piper', 'Massive Dynamic', 'Vandelay Industries', 'Duff Beer', 'Gekko & Co', 'Oceanic Airlines',
  'Biffco Enterprises', 'Virtucon', 'Good Burger', 'Prestige Worldwide', 'Monsters Inc', 'Genco Pura Olive Oil',
  'Rich Industries', 'Spacely Space Sprockets', 'Globex Corporation', 'Acme Widgets', 'Sterling Cooper',
  'Bluth Company', 'Dunder Mifflin', 'Paper Street Soap Co', 'Central Perk', 'Cheers', 'Los Pollos Hermanos',
  'Double R Diner', 'The Krusty Krab', "Moe's Tavern", "Freddy Fazbear's Pizza", 'Pizza Planet'
];

const tableData = [
  {
    account: 'Salesforce Systems',
    renewal: '5/31/23',
    mrrPrior: '$990.00',
    manager: 'Trish King',
    team: 'L3 Mids Market Engaged High-Value',
    increase: 1,
    mrrAfter: '$1,085.00',
    result: 'Price Increase',
    noIncrease: '$884.07'
  },
  {
    account: 'Americold Networks',
    renewal: '5/31/23',
    mrrPrior: '$990.00',
    manager: 'Rachel Driver',
    team: 'L3 Enterprise Engaged High-Value',
    increase: 1,
    mrrAfter: '$1,085.00',
    result: 'Price Increase',
    noIncrease: '$884.07'
  },
  {
    account: 'DigitalOcean',
    renewal: '5/31/23',
    mrrPrior: '$972.15',
    manager: 'Trish King',
    team: 'L3 Mids Market Engaged High-Value',
    increase: 1,
    mrrAfter: '$1,077.00',
    result: 'Churn',
    noIncrease: '$867.13'
  },
  // 36 more rows
  ...Array.from({ length: 36 }, (_, i) => ({
    account: randomAccountNames[i % randomAccountNames.length],
    renewal: '6/1/23',
    mrrPrior: `$${(900 - i * 10).toFixed(2)}`,
    manager: i % 2 === 0 ? 'Trish King' : 'Rachel Driver',
    team: i % 3 === 0 ? 'L3 Mids Market Engaged High-Value' : 'L3 Enterprise Engaged High-Value',
    increase: 1,
    mrrAfter: `$${(1000 - i * 10).toFixed(2)}`,
    result: (i === 5 || i === 15 || i === 25) ? 'Churn' : 'Price Increase',
    noIncrease: `$${(800 - i * 10).toFixed(2)}`
  }))
];

const Reports = () => (
  <Container className="mt-5 pt-5">
    <Row className="mb-4">
      {summaryData.map((item) => (
        <Col key={item.label} md={4}>
          <Card style={{ background: '#111', color: '#fff', textAlign: 'center', border: 'none' }}>
            <Card.Body>
              <Card.Title style={{ fontSize: 18 }}>{item.label}</Card.Title>
              <div style={{ fontSize: 36, fontWeight: 700 }}>{item.value}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
    <Row className="mb-4">
      <Col>
        <div style={{ background: '#000', borderRadius: 12, padding: 24 }}>
          <Bar data={chartData} options={chartOptions} height={120} />
        </div>
      </Col>
    </Row>
    <Row>
      <Col>
        <div style={{ background: '#000', borderRadius: 12, padding: 24 }}>
          <Table striped bordered hover size="sm" style={{ background: '#111', color: '#fff' }}>
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Managed Renewal Date</th>
                <th>MRR Prior to Renewal</th>
                <th>Renewal Manager</th>
                <th>Renewal Team Chart Placement</th>
                <th>Increase Activated</th>
                <th>MRR After Renewal</th>
                <th>Result</th>
                <th>No Increase Projected GRR</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.account}</td>
                  <td>{row.renewal}</td>
                  <td>{row.mrrPrior}</td>
                  <td>{row.manager}</td>
                  <td>{row.team}</td>
                  <td>{row.increase}</td>
                  <td>{row.mrrAfter}</td>
                  <td>{row.result}</td>
                  <td>{row.noIncrease}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Col>
    </Row>
  </Container>
);

export default Reports; 