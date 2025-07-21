// File: src/components/BudgetBreakdown.tsx
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BudgetCategory } from "@/types";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";

const COLORS = ['#A67C5A', '#B8860B', '#6B8E23', '#708090', '#CD5C5C', '#4682B4'];

export default function BudgetBreakdown({ categories }: { categories: BudgetCategory[] }) {
  const [view, setView] = useState<'summary' | 'detailed'>('summary');

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
    return null;
  }

  return (
    <>
    <section id="budget-breakdown" className="mb-12">
      {/* This div is now outside and above the Card */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: "#64918E" }}>Budget Breakdown</h2>
        <p className="text-gray-200 mb-6 max-w-2xl mx-auto">See how your support helps bring this album to life. Full transparency on where every dollar goes.</p>
      </div>

      <Card className="rounded-xl w-full" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
        <CardContent className="p-6">
          {/* View Toggle Buttons */}
          <Tabs value={view} onValueChange={(value) => setView(value as 'summary' | 'detailed')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 items-center justify-center rounded-lg bg-white/20 p-1 mb-6">
              <TabsTrigger 
                value="summary" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-white transition-all data-[state=active]:bg-[#CB945E] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Summary View
              </TabsTrigger>
              <TabsTrigger 
                value="detailed" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-white transition-all data-[state=active]:bg-[#CB945E] data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Detailed View
              </TabsTrigger>
            </TabsList>
          {/* Conditional Rendering based on view */}
         <TabsContent value="summary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: 'rgba(45, 53, 52, 0.9)', borderColor: '#64918E', color: 'white' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {chartData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors min-h-[52px]">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="font-semibold text-sm text-[#2D3534]">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-[#64918E]">${entry.value.toLocaleString()}</div>
                      <div className="text-xs text-[#2D3534]/70">{((entry.value / totalBudget) * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-[#CB945E] min-h-[52px]">
                    <div className="font-semibold text-lg text-[#2D3534]">Total Project Budget</div>
                    <div className="font-bold text-lg text-green-500">${totalBudget.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="detailed">
            <div className="space-y-3">
              <Accordion type="multiple" className="w-full">
                {categories.map((category, index) => {
                  const categoryTotal = category.budget_line_items.reduce((acc, item) => acc + item.cost, 0);
                  return (
                    <AccordionItem value={`item-${category.id}`} key={category.id} className=" mb-2 border-b-0">
                      <AccordionTrigger className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors min-h-[52px] group hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="font-semibold text-sm text-[#2D3534] group-hover:text-[#64918E] transition-colors">{category.name}</span>
                          <Badge className="bg-[#CB945E] text-white font-semibold text-xs ml-2">{category.budget_line_items.length} items</Badge>
                        </div>
                        <div className="flex flex-1 justify-end items-center gap-3">
                          <span className="font-bold text-sm text-[#64918E]">${categoryTotal.toLocaleString()}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-1">
                        <div className="ml-[28px] space-y-2 mt-2">
                          {category.budget_line_items.map(item => (
                            <div key={item.id} className="flex justify-between items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              <div>
                                <div className="font-medium text-sm text-[#2D3534]">{item.name}</div>
                                {item.notes && <div className="text-xs text-[#2D3534]/70 mt-1">{item.notes}</div>}
                              </div>
                              <div className="font-semibold text-sm text-[#64918E]">${item.cost.toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-[#CB945E] mt-3 min-h-[52px]">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="font-semibold text-lg text-[#2D3534]">Total Project Budget</span>
                </div>
                <div className="font-bold text-lg text-green-500">${totalBudget.toLocaleString()}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </CardContent>
      </Card>
    </section>
    </>
  );
}