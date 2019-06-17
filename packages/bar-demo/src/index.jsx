// title: 横向柱状图 （条形图）
// desc: 这是个非常🐂🍺的柱状图，用于对比分类数据的数值大小

import { BarChart } from 'bizcharts';

class DemoChart extends React.Component {
  render() {
    return <BarChart
      data={data}
      height={350}
      width={500}
      xField="value"
      yField="year"
      label={{
        visible: true,
        formatter: (text) => {
          return `${text}条记录`;
        },
        offsetX: -6,
        style: {
          fill: 'gray'
        }
      }}
    />
  }
}

const data = [ {
  year: '1991',
  value: 3
}, {
  year: '1992',
  value: 4
}, {
  year: '1993',
  value: 3.5
}, {
  year: '1994',
  value: 5
}, {
  year: '1995',
  value: 4.9
}, {
  year: '1996',
  value: 6
}, {
  year: '1997',
  value: 7
}, {
  year: '1998',
  value: 9
}, {
  year: '1999',
  value: 13
} ];


ReactDOM.render(<DemoChart />, mountNode);
