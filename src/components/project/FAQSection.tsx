import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export default function FAQSection() {
  const faqs = [
    {
      question: "What am I actually buying?",
      answer: "You are backing a specific tier to support the artist's project. Think of it as buying a ticket that helps contribute to an independent artist's next step in their music career, that also comes with perks—like exclusive access, merch, connections and experiences."
    },
    {
      question: "When will I get my perks & rewards?",
      answer: "Digital and physical perk delivery timelines vary by project. Project-based communities will launch once the artist reaches their funding goal or after 30 days—whichever comes first."
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
      answer: "Each tier has limited availability, so contributions are generally final to help artists plan their projects accurately. If you'd like to change your tier or contribution amount, please reach out to team@theinertiaproject.com and we'll do our best to help, depending on availability."
    },
    {
      question: "How do I access the \"Artist Community\"?",
      answer: "Immediately after checkout, you'll receive a receipt and confirmation email with instructions on next steps. Once the fundraising campaign is complete, you'll receive an email with information on how to join the artist community through the Mighty Networks app."
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
      answer: "For technical issues with the website or payment, you can contact Inertia support directly at team@theinertiaproject.com. Once launched, you can post questions directly in the Artist Community."
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
