// File: src/components/BudgetBreakdown.tsx
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { BudgetCategory } from "@/types";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";

const COLORS = ['#64918E', '#CB945E', '#A9A9A9', '#8884d8', '#FF8042', '#00C49F'];

export default function BudgetBreakdown({ categories }: { categories: BudgetCategory[] }) {
  const [view, setView] = useState<'summary' | 'detailed'>('summary');

  // Calculate totals and chart data once, and only re-calculate if categories change.
  const { totalBudget, chartData } = useMemo(() => {
    if (!categories || categories.length === 0) {
      return { totalBudget: 0, chartData: [] };
    }

    let total = 0;
    const data = categories.map(category => {
      const categoryTotal = category.budget_line_items.reduce((acc, item) => acc + item.cost, 0);
      total += categoryTotal;
      return {
        name: category.name,
        value: categoryTotal,
      };
    });

    return { totalBudget: total, chartData: data };
  }, [categories]);
  
  if (!categories || categories.length === 0) {
    return null; // Don't render anything if there's no budget data
  }

  return (
    <section id="budget-breakdown" className="mb-12">
      <Card className="rounded-xl w-full" style={{ backgroundColor: "#2D3534", border: "2px solid #64918E" }}>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2" style={{ color: "#64918E" }}>Budget Breakdown</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">See how your support helps bring this album to life. Full transparency on where every dollar goes.</p>
          </div>
          
          {/* View Toggle Buttons */}
          <div className="flex justify-center bg-gray-800/50 rounded-lg p-1 mb-6">
            <Button onClick={() => setView('summary')} variant="ghost" className={`flex-1 ${view === 'summary' ? 'bg-[#CB945E] text-white' : 'text-gray-300'} hover:bg-[#CB945E]/80 hover:text-white`}>
              Summary View
            </Button>
            <Button onClick={() => setView('detailed')} variant="ghost" className={`flex-1 ${view === 'detailed' ? 'bg-[#CB945E] text-white' : 'text-gray-300'} hover:bg-[#CB945E]/80 hover:text-white`}>
              Detailed View
            </Button>
          </div>

          {/* Conditional Rendering based on view */}
          {view === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: 'rgba(45, 53, 52, 0.9)', borderColor: '#64918E' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {chartData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="font-medium text-white">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">${entry.value.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">{((entry.value / totalBudget) * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border-t-2 border-green-500">
                  <div className="font-bold text-white">Total Project Budget</div>
                  <div className="font-bold text-green-400">${totalBudget.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {view === 'detailed' && (
            <div className="space-y-2">
              <Accordion type="single" collapsible className="w-full">
                {categories.map((category, index) => {
                  const categoryTotal = category.budget_line_items.reduce((acc, item) => acc + item.cost, 0);
                  return (
                    <AccordionItem value={`item-${category.id}`} key={category.id} className="bg-gray-800/50 rounded-lg mb-2 border-b-0">
                      <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                             <span className="font-medium text-white">{category.name}</span>
                             <Badge variant="secondary">{category.budget_line_items.length} items</Badge>
                          </div>
                          <div className="font-semibold text-white pr-4">${categoryTotal.toLocaleString()}</div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 pt-0">
                        <div className="space-y-2 pl-6 border-l-2 border-gray-700 ml-1.5">
                          {category.budget_line_items.map(item => (
                            <div key={item.id} className="flex justify-between items-center py-2">
                              <div>
                                <div className="text-gray-200">{item.name}</div>
                                {item.notes && <div className="text-xs text-gray-400">{item.notes}</div>}
                              </div>
                              <div className="text-gray-300">${item.cost.toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg mt-4 border-t-2 border-green-500">
                  <div className="font-bold text-white text-lg">Total Project Budget</div>
                  <div className="font-bold text-green-400 text-lg">${totalBudget.toLocaleString()}</div>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}