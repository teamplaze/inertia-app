import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export default function FAQSection() {
  const faqs = [
    {
      question: "What am I actually buying?",
      answer: "You are backing a specific tier to support an artist's project. Think of it like buying a ticket into the creative process: your contribution helps fund the artist's next step and comes with perks like exclusive access, merch, community moments, and artist experiences."
    },
    {
      question: "When will I get my perks & rewards?",
      answer: "Perk delivery timelines vary by project. Digital perks, physical rewards, and community experiences may be delivered at different stages depending on the artist's campaign timeline. Project communities launch after each round of fundraising is completed. Get in early to lock in the exclusive benefits from the early rounds."
    },
    {
      question: "Is my payment secure?",
      answer: "Yes. We use Stripe, a trusted payment processor, to securely handle all transactions. Your financial information is never stored on Inertia's servers."
    },
    {
      question: "What happens if the project doesn't reach its funding goal?",
      answer: "The artist receives the funds raised and uses them to deliver as much of the project as possible. Your contribution still directly supports the artist and helps move the project forward."
    },
    {
      question: "How do I access the Artist Community?",
      answer: "After checkout, you'll receive a receipt and confirmation email with next steps. Once the campaign community opens, you'll receive instructions for joining the artist's community experience."
    }
  ];

  return (
    <section
      className={cn(
        "w-full flex flex-col items-center",
        "px-[var(--spacing-5)] py-[var(--spacing-12)]",
        "md:px-[96px] md:py-[120px]",
        "gap-[var(--spacing-5)] md:gap-[var(--spacing-6)]",
      )}
      style={{ background: '#000000' }}
    >
      {/* Content block */}
      <div
        className={cn(
          "flex flex-col items-start",
          "w-full md:w-[822px]",
          "gap-[var(--spacing-6)] md:gap-[var(--spacing-8)]",
        )}
      >
        {/* Section heading */}
        <h2
          className={cn(
            "font-heading font-medium leading-[1.2]",
            "tracking-normal text-white w-full",
            "text-[20px] md:text-[32px]",
          )}
        >
          FAQ
        </h2>

        {/* Accordion */}
        <Accordion
          type="single"
          collapsible
          className="w-full flex flex-col gap-[var(--spacing-3)]"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
            >
              <AccordionTrigger>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
