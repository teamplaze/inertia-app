import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function FAQSection() {
  const faqs = [
    {
      question: "What am I actually buying?",
      answer: "You are backing a specific tier to support the artist's project. Think of it as buying a ticket that helps contribute to an independent artist’s next step in their music career, that also comes with perks—like exclusive access, merch, connections and experiences."
    },
    {
      question: "When will I get my merch or rewards?",
      answer: "Digital and Physical delivery times vary by project and are listed in their tier descriptions. Artists will post updates directly to the project page, and community area as production milestones are met. Additionally, you can refer to the project calendar for schedule perks and rewards."
    },
    {
      question: "Is my payment secure?",
      answer: "Yes. We use Stripe, a globally trusted payment processor, to handle all transactions. Your financial information is never stored on our servers."
    },
    {
      question: "What happens if the project doesn't reach its funding goal?",
      answer: "The artist receives any and all funds raised to deliver whatever portion of the project they can."
    },
    {
      question: "Can I upgrade or change my tier later?",
      answer: "Contributions are final to help artists plan their budgets accurately. We are working to allow upgrades and when that option is available, we will notify everyone. If you want to send additional support, you can always make an additional contribution to a higher tier!"
    },
    {
      question: "How do I access the \"Artist Community\"?",
      answer: "Immediately after checkout, you'll receive a receipt and confirmation email with instructions on next steps. Once the fundraising campaign is complete, you’ll receive an email with information on how to join the artist community through the Mighty Networks app."
    },
    {
      question: "Does the artist keep all the money?",
      answer: "Inertia is artist-first. The funds go directly to the artist's project budget. The small processing fee ensures that our Artists get 100% of all funds raised."
    },
    {
      question: "Can I get a refund?",
      answer: "Contributions are non-refundable because they are immediately put to work funding the project (studio time, deposit for merch, etc.). However, if a project is canceled entirely, we will work with them to ensure backers are treated fairly."
    },
    {
      question: "I don't live in the US. Can I still back a project?",
      answer: "Absolutely! We accept contributions from fans worldwide."
    },
    {
      question: "Who do I contact if I have a question about the project?",
      answer: "You can post questions directly in the Artist Community once you've joined that can be answered by the fans or the artist. For technical issues with the website or payment, you can contact Inertia support directly at team@theinertiaproject.com."
    }
  ];

  return (
    <Card className="bg-[#2D3534] border-[#CB945E] text-white mt-12">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#CB945E]" />
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-white/15">
              <AccordionTrigger className="text-left text-lg font-medium hover:text-[#CB945E] transition-colors [&>svg]:text-white">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="mb-4 text-white-200 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}