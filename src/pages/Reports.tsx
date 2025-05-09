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
// @ts-ignore
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const summaryData = [
  { label: 'Accounts Uplifted', value: 36 },
  { label: 'Incremental MRR', value: '$2,126.35' },
  { label: 'Churned Accounts', value: 3 }
];

const chartData = {
  labels: ['5/1/2025'],
  datasets: [
    {
      label: 'No Increase Projected GRR',
      data: [8292.38],
      backgroundColor: '#ffc107',
      borderColor: '#ffc107',
      borderWidth: 1
    },
    {
      label: 'MRR Prior to Renewal',
      data: [9197.78],
      backgroundColor: '#ededed',
      borderColor: '#ededed',
      borderWidth: 1
    },
    {
      label: 'MRR After Renewal',
      data: [10892.83],
      backgroundColor: '#4285f4',
      borderColor: '#4285f4',
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
    },
    datalabels: {
      display: true,
      color: '#fff',
      anchor: 'end',
      align: 'top',
      font: { weight: 'bold', size: 14 },
      formatter: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } as const,
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.1)' },
      ticks: { color: '#fff' }
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.1)' },
      ticks: {
        color: '#fff',
        callback: (tickValue: string | number) => {
          const num = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
          return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      }
    }
  }
};

const tableData = [
  { account: 'SolarCore Systems', renewal: '5/25/25', mrrPrior: '$999.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$1,168.83', result: 'Price Increase', noIncrease: '$884.67' },
  { account: 'AscendCore Networks', renewal: '5/31/25', mrrPrior: '$998.11', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$1,167.79', result: 'Price Increase', noIncrease: '$883.89' },
  { account: 'BrightNet Networks', renewal: '5/20/25', mrrPrior: '$998.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$1,167.66', result: 'Price Increase', noIncrease: '$883.79' },
  { account: 'Cloud Networks', renewal: '5/18/25', mrrPrior: '$972.15', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$1,137.42', result: 'Price Increase', noIncrease: '$860.90' },
  { account: 'BrightNet Group', renewal: '5/31/25', mrrPrior: '$961.93', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Moderate Mid-Value', increase: 1, mrrAfter: '$1,125.46', result: 'Price Increase', noIncrease: '$905.57' },
  { account: 'DataZone Enterprises', renewal: '5/22/25', mrrPrior: '$948.64', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$1,109.91', result: 'Price Increase', noIncrease: '$840.08' },
  { account: 'BrightPoint Dynamics', renewal: '5/29/25', mrrPrior: '$948.01', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$1,109.17', result: 'Price Increase', noIncrease: '$839.52' },
  { account: 'Tech Labs', renewal: '5/17/25', mrrPrior: '$937.01', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$1,096.30', result: 'Price Increase', noIncrease: '$829.78' },
  { account: 'AscendZone Enterprises', renewal: '5/19/25', mrrPrior: '$916.67', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Moderate Mid-Value', increase: 1, mrrAfter: '$1,072.50', result: 'Price Increase', noIncrease: '$862.96' },
  { account: 'NovaSpark Ventures', renewal: '5/15/25', mrrPrior: '$907.36', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$1,061.61', result: 'Price Increase', noIncrease: '$803.52' },
  { account: 'NeoCore Solutions', renewal: '5/1/25', mrrPrior: '$897.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Moderate Mid-Value', increase: 1, mrrAfter: '$1,049.49', result: 'Price Increase', noIncrease: '$794.35' },
  { account: 'LumenCore Partners', renewal: '5/17/25', mrrPrior: '$837.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '0', result: 'Churn', noIncrease: '$787.96' },
  { account: 'NextWave Labs', renewal: '5/24/25', mrrPrior: '$834.70', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Moderate Mid-Value', increase: 1, mrrAfter: '$976.60', result: 'Price Increase', noIncrease: '$785.79' },
  { account: 'NextCore Technologies', renewal: '5/30/25', mrrPrior: '$831.66', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$973.04', result: 'Price Increase', noIncrease: '$736.48' },
  { account: 'SwiftSpark Ventures', renewal: '5/31/25', mrrPrior: '$749.69', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$877.14', result: 'Price Increase', noIncrease: '$663.89' },
  { account: 'OmniPoint Solutions', renewal: '5/25/25', mrrPrior: '$743.04', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$869.36', result: 'Price Increase', noIncrease: '$658.01' },
  { account: 'OmniSpark Industries', renewal: '5/24/25', mrrPrior: '$717.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$838.89', result: 'Price Increase', noIncrease: '$634.95' },
  { account: 'EchoCore Dynamics', renewal: '5/24/25', mrrPrior: '$700.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$819.00', result: 'Price Increase', noIncrease: '$658.98' },
  { account: 'OmniGrid Systems', renewal: '5/20/25', mrrPrior: '$698.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Moderate Mid-Value', increase: 1, mrrAfter: '$816.66', result: 'Price Increase', noIncrease: '$657.10' },
  { account: 'FusionEdge Concepts', renewal: '5/12/25', mrrPrior: '$682.36', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$798.36', result: 'Price Increase', noIncrease: '$642.38' },
  { account: 'CloudCore Dynamics', renewal: '5/28/25', mrrPrior: '$650.70', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$761.32', result: 'Price Increase', noIncrease: '$576.23' },
  { account: 'TechCore Solutions', renewal: '5/30/25', mrrPrior: '$640.93', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$740.98', result: 'Price Increase', noIncrease: '$567.58' },
  { account: 'CloudGrid Ventures', renewal: '5/29/25', mrrPrior: '$633.32', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$705.24', result: 'Price Increase', noIncrease: '$560.84' },
  { account: 'NovaLink Ventures', renewal: '5/28/25', mrrPrior: '$602.77', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '0', result: 'Churn', noIncrease: '$533.79' },
  { account: 'HyperPoint Technologies', renewal: '6/7/25', mrrPrior: '$599.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$700.83', result: 'Price Increase', noIncrease: '$530.45' },
  { account: 'HyperLine Holdings', renewal: '5/24/25', mrrPrior: '$574.91', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$672.64', result: 'Price Increase', noIncrease: '$509.12' },
  { account: 'Fusion Industries', renewal: '5/26/25', mrrPrior: '$572.46', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$669.78', result: 'Price Increase', noIncrease: '$538.92' },
  { account: 'GreenZone Networks', renewal: '5/17/25', mrrPrior: '$566.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$662.45', result: 'Price Increase', noIncrease: '$533.02' },
  { account: 'Lumen Concepts', renewal: '5/29/25', mrrPrior: '$543.51', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$634.51', result: 'Price Increase', noIncrease: '$487.07' },
  { account: 'GreenPoint Enterprises', renewal: '5/31/25', mrrPrior: '$536.83', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$628.09', result: 'Price Increase', noIncrease: '$505.38' },
  { account: 'Neo Logics', renewal: '5/15/25', mrrPrior: '$533.93', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$624.70', result: 'Price Increase', noIncrease: '$472.30' },
  { account: 'Prime Holdings', renewal: '5/29/25', mrrPrior: '$520.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$585.00', result: 'Price Increase', noIncrease: '$460.49' },
  { account: 'LumenPoint Partners', renewal: '6/9/25', mrrPrior: '$500.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$585.00', result: 'Price Increase', noIncrease: '$442.78' },
  { account: 'DataNet Innovations', renewal: '5/11/25', mrrPrior: '$500.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$585.00', result: 'Price Increase', noIncrease: '$442.78' },
  { account: 'Nova Systems', renewal: '6/11/25', mrrPrior: '$500.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '$585.00', result: 'Price Increase', noIncrease: '$442.78' },
  { account: 'HyperWave Ventures', renewal: '5/14/25', mrrPrior: '$500.00', manager: 'Trish King', team: 'L3 Mid-Market', chart: 'Disengaged Mid-Value', increase: 1, mrrAfter: '0', result: 'Churn', noIncrease: '$442.78' }
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
          <Bar data={chartData} options={chartOptions} height={120} plugins={[ChartDataLabels]} />
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
                <th>R Prior to Renewal</th>
                <th>Renewal Manager</th>
                <th>Renewal Team</th>
                <th>Chart Placement</th>
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
                  <td>{row.chart}</td>
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