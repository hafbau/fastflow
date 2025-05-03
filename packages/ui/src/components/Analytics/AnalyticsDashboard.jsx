import React, { useState, useEffect } from 'react';
import { Grid, Typography, Paper, Box, Tab, Tabs, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AccessPatternAnalytics from './AccessPatternAnalytics';
import PermissionUsageAnalytics from './PermissionUsageAnalytics';
import ComplianceAnalytics from './ComplianceAnalytics';
import SecurityAnalytics from './SecurityAnalytics';
import AlertsPanel from './AlertsPanel';
import DateRangePicker from './DateRangePicker';
import { fetchAnalyticsData } from '../../api/analytics';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index) => {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
};

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    accessPatterns: null,
    permissionUsage: null,
    compliance: null,
    security: null,
    alerts: null,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchAnalyticsData({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dateRange]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              Analytics Dashboard
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <DateRangePicker
                dateRange={dateRange}
                onChange={handleDateRangeChange}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Access Patterns" {...a11yProps(0)} />
          <Tab label="Permission Usage" {...a11yProps(1)} />
          <Tab label="Compliance" {...a11yProps(2)} />
          <Tab label="Security" {...a11yProps(3)} />
          <Tab label="Alerts" {...a11yProps(4)} />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <AccessPatternAnalytics data={analyticsData.accessPatterns} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <PermissionUsageAnalytics data={analyticsData.permissionUsage} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <ComplianceAnalytics data={analyticsData.compliance} />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <SecurityAnalytics data={analyticsData.security} />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              <AlertsPanel alerts={analyticsData.alerts} />
            </TabPanel>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AnalyticsDashboard;