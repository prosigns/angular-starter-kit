import { Component } from '@angular/core';

@Component({
  selector: 'app-analytics',
  standalone: true,
  template: `
    <div class="analytics-container">
      <h1>Analytics Dashboard</h1>

      <div class="analytics-header">
        <div class="time-period">
          <span>Time Period:</span>
          <select class="period-select">
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days" selected>Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <button class="export-btn">Export Data</button>
      </div>

      <div class="analytics-summary">
        <div class="summary-card">
          <div class="card-title">Total Users</div>
          <div class="card-value">12,345</div>
          <div class="card-change positive">+12.3%</div>
        </div>

        <div class="summary-card">
          <div class="card-title">Active Users</div>
          <div class="card-value">4,567</div>
          <div class="card-change positive">+5.7%</div>
        </div>

        <div class="summary-card">
          <div class="card-title">Sessions</div>
          <div class="card-value">28,539</div>
          <div class="card-change positive">+18.2%</div>
        </div>

        <div class="summary-card">
          <div class="card-title">Avg. Session Duration</div>
          <div class="card-value">4m 23s</div>
          <div class="card-change negative">-1.5%</div>
        </div>
      </div>

      <div class="analytics-charts">
        <div class="chart-container">
          <div class="chart-header">
            <h2>User Activity</h2>
            <div class="chart-controls">
              <button class="chart-btn active">Users</button>
              <button class="chart-btn">Sessions</button>
            </div>
          </div>
          <div class="chart-placeholder">
            <!-- In a real app, this would be a chart component -->
            <div class="placeholder-chart">
              <div class="bar-chart">
                <div class="bar" style="height: 40%"></div>
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 45%"></div>
                <div class="bar" style="height: 75%"></div>
                <div class="bar" style="height: 90%"></div>
                <div class="bar" style="height: 65%"></div>
                <div class="bar" style="height: 80%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-header">
            <h2>Traffic Sources</h2>
          </div>
          <div class="chart-placeholder">
            <!-- In a real app, this would be a chart component -->
            <div class="placeholder-chart">
              <div class="pie-chart">
                <div class="pie-slice slice1"></div>
                <div class="pie-slice slice2"></div>
                <div class="pie-slice slice3"></div>
                <div class="pie-slice slice4"></div>
              </div>
              <div class="pie-legend">
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #3f51b5"></span>
                  <span class="legend-label">Direct (42%)</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #f44336"></span>
                  <span class="legend-label">Social (28%)</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #4caf50"></span>
                  <span class="legend-label">Search (20%)</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #ff9800"></span>
                  <span class="legend-label">Referral (10%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="analytics-details">
        <div class="table-container">
          <div class="table-header">
            <h2>Top Pages</h2>
          </div>
          <table class="analytics-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Views</th>
                <th>Avg. Time</th>
                <th>Bounce Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>/dashboard</td>
                <td>4,523</td>
                <td>2m 34s</td>
                <td>24.5%</td>
              </tr>
              <tr>
                <td>/products</td>
                <td>3,842</td>
                <td>3m 12s</td>
                <td>18.7%</td>
              </tr>
              <tr>
                <td>/login</td>
                <td>2,738</td>
                <td>0m 45s</td>
                <td>42.3%</td>
              </tr>
              <tr>
                <td>/profile</td>
                <td>2,105</td>
                <td>5m 17s</td>
                <td>12.8%</td>
              </tr>
              <tr>
                <td>/settings</td>
                <td>1,893</td>
                <td>4m 53s</td>
                <td>9.6%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .analytics-container {
        padding: 20px;
      }

      h1 {
        margin-bottom: 24px;
        color: #333;
      }

      .analytics-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .time-period {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .period-select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }

      .export-btn {
        padding: 8px 16px;
        background-color: #3f51b5;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
      }

      .analytics-summary {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .summary-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 20px;
      }

      .card-title {
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .card-value {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .card-change {
        font-size: 14px;
        font-weight: 500;
      }

      .positive {
        color: #4caf50;
      }

      .negative {
        color: #f44336;
      }

      .analytics-charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .chart-container {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 20px;
      }

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .chart-header h2 {
        margin: 0;
        font-size: 18px;
      }

      .chart-controls {
        display: flex;
        gap: 8px;
      }

      .chart-btn {
        padding: 6px 12px;
        background-color: #f5f5f5;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
      }

      .chart-btn.active {
        background-color: #3f51b5;
        color: white;
      }

      .chart-placeholder {
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .placeholder-chart {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .bar-chart {
        display: flex;
        align-items: flex-end;
        gap: 12px;
        height: 200px;
        width: 100%;
        padding: 20px;
      }

      .bar {
        flex-grow: 1;
        background-color: #3f51b5;
        border-radius: 4px 4px 0 0;
      }

      .pie-chart {
        width: 200px;
        height: 200px;
        position: relative;
        border-radius: 50%;
        overflow: hidden;
      }

      .pie-slice {
        position: absolute;
        width: 100%;
        height: 100%;
      }

      .slice1 {
        background-color: #3f51b5;
        clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%);
      }

      .slice2 {
        background-color: #f44336;
        clip-path: polygon(50% 50%, 50% 100%, 0% 100%, 0% 50%);
      }

      .slice3 {
        background-color: #4caf50;
        clip-path: polygon(50% 50%, 0% 50%, 0% 0%, 30% 0%);
      }

      .slice4 {
        background-color: #ff9800;
        clip-path: polygon(50% 50%, 30% 0%, 50% 0%);
      }

      .pie-legend {
        margin-left: 20px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }

      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        margin-right: 8px;
      }

      .table-container {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 20px;
      }

      .table-header {
        margin-bottom: 20px;
      }

      .table-header h2 {
        margin: 0;
        font-size: 18px;
      }

      .analytics-table {
        width: 100%;
        border-collapse: collapse;
      }

      .analytics-table th,
      .analytics-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      .analytics-table th {
        font-weight: 600;
        color: #555;
      }

      @media (max-width: 768px) {
        .analytics-charts {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class AnalyticsComponent {}
