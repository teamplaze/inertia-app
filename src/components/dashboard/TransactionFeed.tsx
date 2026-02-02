'use client';

import { useState, useEffect } from 'react';
import { getTransactions, getAllTransactionsForExport, type TransactionData } from '@/lib/actions/dashboard';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface TransactionFeedProps {
  projectId: number;
}

export default function TransactionFeed({ projectId }: TransactionFeedProps) {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // Fetch data when page or projectId changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, totalCount } = await getTransactions(projectId, page, pageSize);
        setTransactions(data);
        setTotalCount(totalCount);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, page]);

  // Export to CSV
  const handleExport = async () => {
    try {
      const data = await getAllTransactionsForExport(projectId);
      
      // Convert to CSV string
      const headers = ["Date", "Amount", "Tier", "Backer", "Email"];
      const csvContent = [
        headers.join(","),
        ...data.map(row => 
          [row.Date, row.Amount, `"${row.Tier}"`, `"${row.Backer}"`, row.Email].join(",")
        )
      ].join("\n");

      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `transactions_project_${projectId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export transactions", error);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const startRow = (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalCount);

  return (
    <Card className="bg-[#2D3534] border-[#CB945E] text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Contributions</CardTitle>
        <Button  
            size="sm" 
            onClick={handleExport}
            className="bg-[#CB945E] hover:bg-[#CB945E]/90 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#CB945E]" />
          </div>
        ) : (
          <>
            <div className="rounded-md border border-gray-700 overflow-hidden">
                <Table>
                <TableHeader className="bg-[#1E2322]">
                    <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-gray-400">Amount</TableHead>
                    <TableHead className="text-gray-400">Tier</TableHead>
                    <TableHead className="text-gray-400">Backer</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-right text-gray-400">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.length > 0 ? transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-gray-700 hover:bg-white/5">
                        <TableCell className="font-medium text-[#CB945E]">
                            ${tx.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{tx.tier_name}</TableCell>
                        <TableCell>{tx.backer_name}</TableCell>
                        <TableCell className="text-gray-400 text-sm">{tx.backer_email}</TableCell>
                        <TableCell className="text-right text-gray-400">
                            {new Date(tx.date).toLocaleDateString()}
                        </TableCell>
                    </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                No contributions yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalCount > 0 && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-400">
                        Viewing {startRow}–{endRow} of {totalCount}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="border-gray-600 text-gray-300 hover:bg-white/10"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="border-gray-600 text-gray-300 hover:bg-white/10"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}