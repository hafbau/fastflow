import React, { useState } from 'react';
import { 
  Grid, 
  Typography, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  LinearProgress,
  Tab,
  Tabs
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
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
    id: `compliance-tab-${index}`,
    'aria-controls': `compliance-tabpanel-${index}`,
  };
};

const ComplianceAnalytics = ({ data }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">No compliance data available.</Typography>
      </Box>
    );
  }

  const { soc2Compliance, accessReviews, policyViolations } = data;

  // SOC2 Compliance Score Card
  const ComplianceScoreCard = () => {
    const getScoreColor = (score) => {
      if (score >= 90) return theme.palette.success.main;
      if (score >= 70) return theme.palette.warning.main;
      return theme.palette.error.main;
    };

    const getScoreIcon = (score) => {
      if (score >= 90) return <CheckCircleIcon color="success" />;
      if (score >= 70) return <WarningIcon color="warning" />;
      return <ErrorIcon color="error" />;
    };

    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="SOC2 Compliance Status" 
          subheader={`Last updated: ${new Date(soc2Compliance.lastUpdated).toLocaleString()}`}
        />
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    border: `16px solid ${getScoreColor(soc2Compliance.complianceScore)}`,
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {soc2Compliance.complianceScore}%
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {soc2Compliance.complianceStatus}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Compliance Factors</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {soc2Compliance.accessReviewStats.completionRate >= 90 ? 
                      <CheckCircleIcon color="success" /> : 
                      <WarningIcon color="warning" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Access Review Completion" 
                    secondary={`${soc2Compliance.accessReviewStats.completionRate.toFixed(1)}% (${soc2Compliance.accessReviewStats.completedReviews}/${soc2Compliance.accessReviewStats.totalReviews})`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {soc2Compliance.accessReviewStats.rejectedItems === 0 ? 
                      <CheckCircleIcon color="success" /> : 
                      <WarningIcon color="warning" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Rejected Access Items" 
                    secondary={`${soc2Compliance.accessReviewStats.rejectedItems} items rejected`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {soc2Compliance.policyViolations.total <= 5 ? 
                      <CheckCircleIcon color="success" /> : 
                      <ErrorIcon color="error" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Policy Violations" 
                    secondary={`${soc2Compliance.policyViolations.total} violations by ${soc2Compliance.policyViolations.uniqueUsers} users`} 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Access Review Status
  const AccessReviewStatus = () => {
    const COLORS = [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main
    ];

    const statusData = [
      { name: 'Pending', value: accessReviews.summary.statusDistribution.pending },
      { name: 'In Progress', value: accessReviews.summary.statusDistribution.inProgress },
      { name: 'Completed', value: accessReviews.summary.statusDistribution.completed },
      { name: 'Cancelled', value: accessReviews.summary.statusDistribution.cancelled }
    ];

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
      return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Access Review Status" 
          subheader={`Total Reviews: ${accessReviews.summary.totalReviews}`}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Completion Rate" 
                    secondary={`${accessReviews.summary.completionRate.toFixed(1)}%`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="error" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Overdue Reviews" 
                    secondary={`${accessReviews.summary.overdueReviews} reviews past due date`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Average Items Per Review" 
                    secondary={`${accessReviews.summary.averageItemsPerReview.toFixed(1)} items`} 
                  />
                </ListItem>
              </List>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" color="primary">
                  View All Access Reviews
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Policy Violations
  const PolicyViolations = () => {
    const violationData = policyViolations.byResourceType.map(item => ({
      name: item.resourceType,
      violations: item.count
    }));

    return (
      <Card>
        <CardHeader 
          title="Policy Violations" 
          subheader={`Total Violations: ${policyViolations.total}`}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={violationData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="violations" fill={theme.palette.error.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Top Violators</Typography>
              <List dense>
                {policyViolations.topViolators.map((violator, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <SecurityIcon color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`User: ${violator.userId}`} 
                      secondary={`${violator.violationCount} violations`} 
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <ComplianceScoreCard />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="compliance tabs">
          <Tab label="Access Reviews" {...a11yProps(0)} />
          <Tab label="Policy Violations" {...a11yProps(1)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <AccessReviewStatus />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <PolicyViolations />
      </TabPanel>
    </Box>
  );
};

export default ComplianceAnalytics;