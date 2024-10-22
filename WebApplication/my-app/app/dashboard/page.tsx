'use client'

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Papa from 'papaparse'; // For CSV export
import jsPDF from 'jspdf'; // For PDF export
import 'jspdf-autotable'; // For PDF table generation

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const RECORDS_PER_PAGE = 10; // Number of records to display per page

export default function Dashboard() {
  const [tableData, setTableData] = useState([]); // Dynamic data for the table
  const [filters, setFilters] = useState({ timeFrame: 'week', platform: '', mediaType: '' });
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Track current page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/predictions');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Add static data
        const staticData = [
          { date: '2024-10-01', time: '12:00:00', platform: 'X', media_format: 'image', status: 'fake', confidence: 0.85 },
          { date: '2024-10-01', time: '13:00:00', platform: 'Facebook', media_format: 'video', status: 'real', confidence: 0.10 },
          { date: '2024-10-02', time: '15:00:00', platform: 'YouTube', media_format: 'audio', status: 'fake', confidence: 0.70 },
          { date: '2024-10-03', time: '16:00:00', platform: 'X', media_format: 'image', status: 'fake', confidence: 0.60 },
          { date: '2024-10-04', time: '17:00:00', platform: 'YouTube', media_format: 'video', status: 'fake', confidence: 0.70 },
          { date: '2024-10-05', time: '18:00:00', platform: 'YouTube', media_format: 'video', status: 'real', confidence: 0.80 },

        ];

        const combinedData = [...data, ...staticData]; // Combine fetched data with static data
        setTableData(combinedData);
        setFilteredData(combinedData); // Initialize filtered data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters to the data
    const applyFilters = () => {
      const { timeFrame, platform, mediaType } = filters;
      let data = [...tableData];

      // Filter by time frame
      const now = new Date();
      const filterDate = new Date();
      if (timeFrame === 'week') {
        filterDate.setDate(now.getDate() - 7);
      } else if (timeFrame === 'month') {
        filterDate.setMonth(now.getMonth() - 1);
      } else if (timeFrame === 'year') {
        filterDate.setFullYear(now.getFullYear() - 1);
      }
      data = data.filter(row => new Date(`${row.date} ${row.time}`) >= filterDate);

      // Filter by platform (case-insensitive)
      if (platform) {
        data = data.filter(row => row.platform.toLowerCase() === platform.toLowerCase());
      }

      // Filter by media type (case-insensitive)
      if (mediaType) {
        data = data.filter(row => row.media_format.toLowerCase() === mediaType.toLowerCase());
      }

      setFilteredData(data);
      setCurrentPage(1); // Reset to the first page when filters change
    };

    applyFilters();
  }, [filters, tableData]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / RECORDS_PER_PAGE);
  const currentData = filteredData.slice((currentPage - 1) * RECORDS_PER_PAGE, currentPage * RECORDS_PER_PAGE);

  // Platform distribution data for PieChart
  const platformDataMap = filteredData.reduce((acc, row) => {
    const platform = row.platform;
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  const platformChartData = Object.keys(platformDataMap).map(platform => ({
    name: platform,
    value: platformDataMap[platform]
  }));

  // Status distribution data for BarChart
  const statusDataMap = filteredData.reduce((acc, row) => {
    const status = row.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.keys(statusDataMap).map(status => ({
    name: status,
    value: statusDataMap[status]
  }));

  // Media format distribution data for Horizontal BarChart
  const mediaFormatDataMap = filteredData.reduce((acc, row) => {
    const format = row.media_format;
    acc[format] = (acc[format] || 0) + 1;
    return acc;
  }, {});

  const mediaFormatChartData = Object.keys(mediaFormatDataMap).map(format => ({
    subject: format,
    count: mediaFormatDataMap[format]
  }));

  // Ranking of social media based on deepfakes
  const rankingChartData = Object.entries(platformDataMap)
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  const downloadCSV = () => {
    const csvData = filteredData.map(row => ({
      Date: row.date,
      Time: row.time,
      Platform: row.platform,
      MediaFormat: row.media_format,
      Status: row.status,
      Confidence: row.confidence.toFixed(5),
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'deepfake_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ['Date', 'Time', 'Platform', 'Media Format', 'Status', 'Confidence'];
    const tableRows = [];

    filteredData.forEach(row => {
      const rowData = [
        row.date,
        row.time,
        row.platform,
        row.media_format,
        row.status,
        row.confidence.toFixed(5),
      ];
      tableRows.push(rowData);
    });

    doc.text('Deepfake Detection Report', 14, 15);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('deepfake_report.pdf');
  };

  const downloadReport = (format) => {
    if (format === 'csv') {
      downloadCSV();
    } else if (format === 'pdf') {
      downloadPDF();
    }
  };

  // Filter handlers
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Deepfake Detection Dashboard</h1>
        <div className="flex space-x-4">
          <select name="timeFrame" onChange={handleFilterChange} className="border rounded p-2">
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
          <select name="platform" onChange={handleFilterChange} className="border rounded p-2">
            <option value="">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="X">X</option>
            <option value="Facebook">Facebook</option>
            <option value="YouTube">YouTube</option>
          </select>
          <select name="mediaType" onChange={handleFilterChange} className="border rounded p-2">
            <option value="">All Media Types</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Platform Distribution PieChart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution BarChart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar dataKey="value" fill="#82ca9d" name="Count">
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Media Format Distribution Horizontal BarChart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Format Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={mediaFormatChartData}
                layout="vertical" // Set layout to vertical for horizontal bars
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="subject" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ranking of Social Media Platforms by Deepfakes Reported */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ranking of Social Media Platforms by Deepfakes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rankingChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar dataKey="count" fill="#ff7300" name="Deepfake Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deepfake Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Media Format</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length > 0 ? (
                currentData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.time}</TableCell>
                    <TableCell>{row.platform}</TableCell>
                    <TableCell>{row.media_format}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.confidence.toFixed(5)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>No data available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between mt-4">
            <Button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</Button>
            <Button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button onClick={() => downloadReport('csv')} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Download CSV
        </Button>
        <Button onClick={() => downloadReport('pdf')}>
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>
    </div>
  );
}
