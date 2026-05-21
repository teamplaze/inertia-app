// File: src/components/project/BudgetBreakdown.tsx
"use client";

import { useMemo } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import type { SectorProps } from 'recharts';

export type MilestoneLineItem = {
  id: string | number;
  name: string;
  cost: number;
  notes?: string | null;
  category_name?: string;
};

export type Milestone = {
  id: string | number;
  title: string;
  budget_line_items: MilestoneLineItem[];
};

const DEFAULT_COLORS = ['#2D3534', '#CB945E', '#E5E1DC', '#0c6a8f', '#2E8B57'];

export default function BudgetBreakdown({ milestones, colors }: { milestones: Milestone[]; colors?: string[] }) {
  const COLORS = colors?.length ? colors : DEFAULT_COLORS;
  const { totalBudget, chartData } = useMemo(() => {
    if (!milestones || milestones.length === 0) {
      return { totalBudget: 0, chartData: [] };
    }

    let total = 0;
    const data = milestones.map(milestone => {
      const milestoneTotal = milestone.budget_line_items.reduce((acc, item) => acc + item.cost, 0);
      total += milestoneTotal;
      return {
        name: milestone.title,
        value: milestoneTotal,
      };
    });

    return { totalBudget: total, chartData: data };
  }, [milestones]);

  if (!milestones || milestones.length === 0) {
    return null;
  }

  return (
    <section id="budget-breakdown" className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: "#64918E" }}>Budget Breakdown</h2>
        <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
          See how your support helps bring this project to life. Full transparency on where every dollar goes.
        </p>
      </div>

      <div className="rounded-xl w-full p-6" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* Left Side: The Donut Chart */}
            <div className="min-w-0 w-full flex flex-col items-center justify-center lg:sticky lg:top-24">
              <div className="w-full h-[350px] overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart style={{ outline: 'none', background: 'transparent' }}>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={140}
                      paddingAngle={2}
                      stroke="none"
                      activeShape={(props: SectorProps) => <Sector {...props} stroke="none" />}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const { name, value } = payload[0];
                        const color = (payload[0] as any).payload?.fill ?? '#2D3534';
                        return (
                          <div style={{ backgroundColor: '#ffffff', border: '2px solid #CB945E', borderRadius: '8px', padding: '8px 12px' }}>
                            <p style={{ color: '#2D3534', fontWeight: 700, marginBottom: 2 }}>{name}</p>
                            <p style={{ color, fontWeight: 600 }}>${(value as number).toLocaleString()}</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between w-full max-w-sm p-4 bg-white rounded-xl border-2 border-[#CB945E] mt-4">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="font-semibold text-lg text-[#2D3534]">Total Goal</span>
                </div>
                <div className="font-bold text-lg text-green-600">${totalBudget.toLocaleString()}</div>
              </div>
            </div>

            {/* Right Side: The Milestone Accordion */}
            <div className="min-w-0 space-y-3 w-full">
              <Accordion type="multiple" className="w-full">
                {milestones.map((milestone, index) => {
                  const milestoneTotal = milestone.budget_line_items.reduce((acc, item) => acc + item.cost, 0);
                  const color = COLORS[index % COLORS.length];

                  return (
                    <AccordionItem value={`item-${milestone.id}`} key={milestone.id} className="mb-3 border-b-0">

                      <AccordionTrigger className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors group hover:no-underline border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                          <div>
                            <span className="font-semibold text-sm text-[#2D3534] group-hover:text-[#64918E] transition-colors block">
                              {milestone.title}
                            </span>
                            <span className="text-xs text-gray-500 font-normal">
                              {totalBudget > 0 ? ((milestoneTotal / totalBudget) * 100).toFixed(0) : 0}% of total budget
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className="font-bold text-sm" style={{ color: color }}>
                            ${milestoneTotal.toLocaleString()}
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pt-3 pb-1">
                        <div className="ml-[28px] space-y-3">
                          {milestone.budget_line_items.map((item, itemIndex) => (
                            <div key={item.id ?? `${milestone.id}-${itemIndex}`} className="flex justify-between items-start p-4 bg-white border-l-4 rounded-r-xl shadow-sm hover:bg-gray-50 transition-colors" style={{ borderLeftColor: color }}>
                              <div className="pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="font-medium text-sm text-[#2D3534]">{item.name}</div>
                                  {item.category_name && (
                                    <Badge variant="outline" className="text-[10px] font-semibold text-gray-500 border-gray-300">
                                      {item.category_name}
                                    </Badge>
                                  )}
                                </div>
                                {item.notes && <div className="text-xs text-gray-600 leading-snug">{item.notes}</div>}
                              </div>
                              <div className="font-semibold text-sm text-[#2D3534] whitespace-nowrap mt-0.5">
                                ${item.cost.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>

          </div>
      </div>
    </section>
  );
}
