// File: src/app/sign-up/page.tsx
"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js'; // Import Stripe loader
import { usePostHog } from "posthog-js/react";


// Load Stripe outside render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const posthog = usePostHog();
  // Capture Checkout Intent
  const action = searchParams.get('action');
  const projectId = searchParams.get('projectId');
  const tierId = searchParams.get('tierId');
  // Also support generic redirect if used elsewhere
  const redirectUrl = searchParams.get('redirect'); 

  useEffect(() => {
    posthog.capture("signup_page_viewed", {
      via_invite: !!inviteToken,
      user_type_intent: inviteToken ? "artist" : "fan",
      signup_source: action === "checkout" ? "checkout_intent" : "standard",
      project_id: projectId ? Number(projectId) : null,
      tier_id: tierId ? Number(tierId) : null,
    });
    // run once per page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
        const response = await fetch('/api/auth/sign-up', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
            inviteToken: inviteToken || null, 
          }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          setMessage('Account created! preparing next step...');
          posthog.capture("user_signed_up", {
          user_type: inviteToken ? "artist" : "fan",
          via_invite: !!inviteToken,
          signup_source: action === "checkout" ? "checkout_intent" : "standard",
          project_id: projectId ? Number(projectId) : null,
          tier_id: tierId ? Number(tierId) : null,
        });
          // --- CHECKOUT REDIRECT LOGIC ---
          if (action === 'checkout' && projectId && tierId) {
             setMessage('Redirecting to checkout...');
             
             // Initiate Checkout immediately
             const checkoutRes = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tierId: Number(tierId), projectId: Number(projectId) }),
             });
             
             if (checkoutRes.ok) {
                 const { sessionId } = await checkoutRes.json();
                 const stripe = await stripePromise;
                 if (stripe) {
                     await stripe.redirectToCheckout({ sessionId });
                     return; // Stop execution, browser is redirecting
                 }
             } else {
                 console.error('Auto-checkout failed, falling back to project page');
                 // Fallback: Go to project page so they can click button again
                 window.location.href = `/projects/${projectId}`;
                 return;
             }
          }
    
          // --- STANDARD REDIRECT LOGIC ---
          setTimeout(() => {
             if (redirectUrl) {
               window.location.href = redirectUrl;
             } else {
               window.location.href = data.redirectTo || '/';
             }
          }, 1000);
          
        } else {
          setMessage(`Sign-up failed: ${data.details || data.error || 'Please try again.'}`);
          setIsLoading(false);
        }
    } catch (error) {
        console.error(error);
        setMessage("An unexpected error occurred.");
        setIsLoading(false);
    }
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 1) {
      setTermsScrolled(true);
    }
  };

    // Construct the Login URL preserving params
  const getLoginUrl = () => {
      const params = new URLSearchParams();
      if (action) params.set('action', action);
      if (projectId) params.set('projectId', projectId);
      if (tierId) params.set('tierId', tierId);
      if (redirectUrl) params.set('redirect', redirectUrl);
      if (inviteToken) params.set('invite', inviteToken);
      
      const queryString = params.toString();
      return queryString ? `/login?${queryString}` : '/login';
  };

  return (
    <Card className="mx-auto max-w-sm w-full" style={{ backgroundColor: "#64918E", border: "2px solid #CB945E" }}>
      <CardHeader>
        <CardTitle className="text-2xl text-white flex items-center gap-2">
          {inviteToken ? (
            <>
              <Sparkles className="w-6 h-6 text-[#CB945E]" />
              Artist Access
            </>
          ) : (
            "Create an Account"
          )}
        </CardTitle>
        <CardDescription className="text-white">
          {inviteToken 
            ? "You have been invited to join Inertia as an Artist." 
            : "Enter your information to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUpSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="font-medium text-gray-200">Name</Label>
            <Input id="name" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="font-medium text-gray-200">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="font-medium text-gray-200">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="text-white placeholder:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#CB945E]" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              onCheckedChange={(checked) => setTermsAgreed(Boolean(checked))}
              disabled={!termsScrolled}
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="terms" className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the 
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="underline ml-1 text-white/80 hover:text-white">
                      Terms and Conditions
                    </button>
                  </DialogTrigger>
                  <DialogContent onScroll={handleTermsScroll} className="sm:max-w-[600px] h-[80vh] flex flex-col bg-[#2D3534] text-white border-[#64918E]">
                    <DialogHeader>
                      <DialogTitle>Terms & Conditions</DialogTitle>
                      <DialogDescription>Please scroll to the bottom to agree.</DialogDescription>
                    </DialogHeader>
                    <div onScroll={handleTermsScroll} className="overflow-y-auto p-4 flex-1">
                       <p>
                        This Website (together with any successor Website(s) and all Services (as defined below), the "Website") is operated by The Inertia Project, Inc. ("Inertia," "we," "us"). We provide Website users with access to content and services related to us and our artists, including music, images, forums, text, data and other content (collectively, the "Services"). Your use of the Website is governed by these Terms of Use (this "Agreement"), without regard to how you access the website (Internet, Wireless Access Protocol, mobile network, or otherwise). This Agreement is between you and us.
                      </p>
                      <p>
                        <strong>The Website may include or be used in connection with certain Third-Party Applications. Your access to or use of such Third-Party Applications may be governed by additional terms and conditions that are not set forth in this Agreement and that are made available by the particular providers of such Third-Party Applications.</strong>
                      </p>
                      <br/>

                      <p>
                        <strong>1. Acceptance of Terms.</strong> By using the Website, you agree to the terms of this Agreement and to any additional rules and guidelines that we post on the Website. We may make changes to this Agreement from time to time; we may notify you of such changes by any reasonable means, including by posting the revised version of this Agreement on the Website. Whenever changes are made to the Website, we will post the date of the most recent changes. Using the Website at any time after there is an update is your affirmative consent that you agree to the new terms. We may, at any time, modify or discontinue all or part of the Website; charge, modify or waive fees required to use the Website; or offer opportunities to some or all Website users.
                      </p>
                      <br/>

                      <p>
                        <strong>2. Jurisdiction.</strong> We operate this Website from the United States and for all intents and purposes intend to be subject to United States jurisdiction and laws only, except as otherwise expressly stated in this Agreement. The Website may not be appropriate or available for use in some jurisdictions outside of the United States. If you access the Website, you do so at your own risk, and you are responsible for complying with all local laws, rules and regulations. We may limit the Website's availability, in whole or in part, to any person, geographic area or jurisdiction we choose, at any time and in our sole discretion.
                      </p>
                      <br/>

                      <p>
                        <strong>3. Information You Submit.</strong> Your Publication of information through the Website is governed by our Privacy Policy (the "Privacy Policy"). Further, to the extent that you submit any personally identifiable information to any third party in connection with the Website, such third party's collection, use and disclosure of such information may be governed by its own privacy policy, and not by our Privacy Policy. In any event, we are not responsible for the information collection, usage, and disclosure practices of third parties. You agree that all information you provide to us is true, accurate and complete, and you will maintain and update such information regularly. If you choose to make any of your personally identifiable or other information publicly available on the Website, you do so at your own risk.
                      </p>
                      <br/>

                      <p>
                        <strong>4. Rules of Conduct.</strong> In using the Website, you agree to obey the law, respect the rights of others and avoid objectionable, defamatory, or disruptive behavior. You agree to comply with the following rules as updated from time to time by us. You will not:
                        <br/>a) Submit, Post, transmit, or otherwise make available, through or in connection with the Website:
                        <br/>i. Anything that is or may be (a) threatening, harassing, degrading, hateful or intimidating; (b) defamatory; (c) fraudulent or tortious; (d) obscene, indecent, pornographic or otherwise objectionable; or (e) protected by copyright, trademark, trade secret, right of publicity or other proprietary right without the express prior consent of the owner of such right.
                        <br/>ii. Any material that would give rise to criminal or civil liability; that encourages conduct that constitutes a criminal offense; promotes gambling; or that encourages or provides instructional information about illegal activities or activities such as "hacking," "cracking" or "phreaking."
                        <br/>iii. Any virus, worm, Trojan horse, Easter egg, time bomb, spyware or other computer code, file, or program that is harmful or invasive or may or is intended to damage or hijack the operation of, or to monitor the use of, any hardware, software or equipment.
                        <br/>iv. Any unsolicited or unauthorized advertising, promotional materials, "junk mail," "spam," "chain letter," "pyramid scheme" or investment opportunity, or any other form of solicitation.
                        <br/>v. Any material non-public information about a company without the proper authorization to do so.
                        <br/>b) Use the Website for any fraudulent or unlawful purpose.
                        <br/>c) Use the Website to defame, abuse, harass, stalk, threaten or otherwise violate the legal rights of others, including without limitation others' privacy rights or rights of publicity, or harvest or collect personally identifiable information about other users of the Website.
                        <br/>d) Impersonate any person or entity, falsely state or otherwise misrepresent your affiliation with any person or entity; or express or imply that we endorse any statement or posting you make.
                        <br/>e) Interfere with or disrupt the operation of the Website or the servers or networks used to make the Website available; or violate any requirements, procedures, policies or regulations of such networks.
                        <br/>f) Restrict or inhibit any other person from using the Website (including by hacking or defacing any portion of the Website).
                        <br/>g) Use the Website to advertise or offer to sell or buy any goods or services without our express prior written consent.
                        <br/>h) Reproduce, duplicate, copy, sell, resell or otherwise exploit for any commercial purposes, any portion of, use of, or access to the Website.
                        <br/>i) Except as expressly permitted by applicable law, modify, adapt, translate, reverse engineer, decompile or disassemble any portion of the Website.
                        <br/>j) Remove any copyright, trademark or other proprietary rights notice from the Website or materials originating from the Website.
                        <br/>k) Frame or mirror any part of the Website without our express prior written consent.
                        <br/>l) Create a database by systematically downloading and storing all or any Website content.
                        <br/>m) Use any robot, spider, Website search/retrieval application or other manual or automatic device to retrieve, index, "scrape," "data mine" or in any way reproduce or circumvent the navigational structure or presentation of the Website, without our express prior, written consent.
                        <br/><br/>
                        We may terminate your use of the Website for any conduct that we consider to be inappropriate, or for your breach of this Agreement (including, without limitation, if you repeatedly engage in copyright infringement via or in connection with the Website).
                      </p>
                      <br/>

                      <p>
                        <strong>5. Registration.</strong> You may need to register to use any part(s) of the Website. We may reject, or require that you change, any username, password or other information that you provide to us in registering. Your username and password are for your personal use only and should be kept confidential; you are responsible for any use of your username and password, and you agree to notify us of any confidentiality breach or unauthorized use of your username and password, or your Website account.
                      </p>
                      <br/>

                      <p>
                        <strong>6. Publications.</strong>
                        <br/>a. <strong>Generally.</strong> The Website may contain areas where you can post information and materials, including, without limitation, text, images, photographs, graphics, music, videos, audiovisual works, data, files, links and other materials (each, a "Publication"). For purposes of clarity, you retain ownership of any Publications that you post, subject to the terms and conditions of this Agreement.
                        <br/>b. <strong>License Grant.</strong> For each Publication that you make, you hereby grant to us and our affiliates (collectively, our "Affiliates") a world-wide, royalty free, fully paid-up, non-exclusive, perpetual, irrevocable, transferable, and fully sublicensable license, without additional consideration to you or any third party, to: (i) reproduce, distribute, transmit, communicate to the public, perform and display (publicly or otherwise), edit, modify, adapt, create derivative works from and otherwise use such Publication, in any format or media now known or hereafter developed, on or in connection with the Website or any of our (or our Affiliates') similar services or products (e.g., any web Websites, and any desktop, mobile or other applications, widgets or APIs) (such services or products, collectively, the "Website-Related Services"); (ii) exercise all trademark, publicity and other proprietary rights with regard to such Publication; (iii) use your name, photograph, portrait, picture, voice, likeness and biographical information as provided by you in connection with your Publication for any promotional purposes related to the Website or the Website-Related Services, in each case, in connection with your Publication; and (iv) use your Publication (including the contents thereof) for any promotional or other business purposes related to the Website, the Website-Related Services, and Artists. For the purpose of clarification, nothing in this Agreement shall be deemed to authorize you to incorporate into any Publication any content or material owned by us, our Affiliates or our respective artists ("Artists"), directors, officers, employees, agents and representatives ("Representatives") and licensors and service providers (collectively, "Partners"). IF YOU DO NOT AGREE TO ANY OF THE LICENSE TERMS, THEN YOU SHOULD NOT MAKE ANY PUBLICATIONS ON THE WEBSITE.
                        <br/>c. <strong>Disclaimers.</strong> It is possible that Website visitors will post information or materials on the Website that are wrong or misleading or that otherwise violate this Agreement. We, our Affiliates and our respective Artists, Representatives and Partners do not endorse and are not responsible for any information or materials made available through the Website or your use of such information or materials. All Publications will be deemed to be non-confidential and may be used by us (i) without any confidentiality or other non-disclosure obligations and (ii) without attribution to you or any third party. We reserve the right, in our sole discretion and at any time, to set limits on the number and size of any Publications that may be posted on the Website or the amount of storage space available for Publications.
                        <br/>d. <strong>Acknowledgement.</strong> You hereby acknowledge and agree that (i) you have received good and valuable consideration in exchange for the rights granted by you hereunder in and to any Publication that you post, including, without limitation, the ability to participate in activities on the Website and the possibility that publicity or favorable exposure may arise from our or our Affiliates' use of such Publication or any derivative works incorporating or embodying such Publication; and (ii) you are not entitled to any further compensation for any use or other exploitation of such Publication by us or our Affiliates or any other party (including, without limitation, our or our Affiliates' Artists, Representatives and Partners) pursuant to the rights in such Publication that have been granted hereunder and/or that are available under applicable law.
                        <br/>e. <strong>Representations and Warranties.</strong> You hereby represent and warrant that: (i) you have the legal right and authority to enter into this Agreement; (ii) you solely own, or otherwise have the full right and permission to exploit, all of the rights in, to, and under any Publication that you post and to grant the rights and licenses set forth herein, and with respect to any third party materials that appear in or are otherwise incorporated or embodied in any Publication that you post, you have obtained express, written clearances from all owners of and rights holders in such third party materials as necessary to grant the rights and licenses set forth herein; (iii) you have obtained the written consent, release, and/or permission of every identifiable individual who appears in any Publication that you post, to use such individual's name and likeness for purposes of using and otherwise exploiting such Publication(s) in the manner contemplated by the Agreement, or, if any such identifiable individual is under the age of eighteen (18), you have obtained such written consent, release and/or permission from such individual's parent or guardian (and you agree to provide to us a copy of any such consents, releases and/or permissions upon our request); (iv) any Publication that you post, and the use thereof by us, our Affiliates, and our and their respective designees (including, without limitation, our and their respective Artists, Representatives and Partners), do not and shall not infringe upon or violate any patent, copyright, trademark, trade secret, or other intellectual property rights or other rights of any third party; (v) any Publication that you post is not confidential and does not contain any confidential information; and (vi) in creating, preparing and posting any Publication, you (A) have complied and will comply in all respects with all applicable laws, rules, and regulations and (B) have not violated and will not violate any understanding by which you are explicitly or implicitly bound (including without limitation any agreement with any third party). If you do post a Publication that contains the likeness of an identifiable individual, we strongly encourage you not to include any identifying information (such as the individual's name or address) within such Publication.
                        <br/>f. <strong>Waiver; Further Assurances; Indemnity.</strong> To the extent permitted under applicable law, you agree to forever release, discharge and waive all claims against us, our Affiliates and our and their respective Artists, Representatives and Partners from, and covenant not to initiate, file, maintain, or proceed upon any suit, claim, demand, or cause of action against us, our Affiliates and our and their respective Artists, Representatives and Partners with respect to, any and all claims, demands, actions, losses, costs, damages, liabilities, judgments, settlements and expenses (including, without limitation, reasonable attorneys' fees) that relate in any way to this Agreement and/or the use of any Publication in a manner consistent with the rights granted under this Agreement, including, without limitation, any claim for idea misappropriation. Additionally, to the extent permitted under applicable law, you hereby waive any and all rights that you may have under laws worldwide that concern "moral rights" or "droit moral," or similar rights, in connection with any Publication that you post (and you hereby represent and warrant that you have obtained clear, express written waivers from any applicable third parties with respect to any and all rights that such third parties may have under such laws in connection with any Publication that you post). At any time upon our request, you shall: (i) take or cause to be taken all such actions as we may reasonably deem necessary or desirable in order for us and our Affiliates to obtain the full benefits of this Agreement and any licenses granted by you hereunder, and (ii) execute a non-electronic hard copy of this Agreement. Without limiting any other provision herein, you agree to indemnify us, our Affiliates, and our and their respective Artists, Representatives and Partners as further set forth herein, including in Section 20 below.
                        <br/>g. <strong>No Obligation to Use.</strong> For the purpose of clarification, it shall be in our sole discretion whether or not to exercise any right granted to us under this Agreement, and we shall have no obligation to use or otherwise exploit any Publication.
                      </p>
                      <br/>

                      <p>
                        <strong>7. Unsolicited Publications.</strong> Notwithstanding anything to the contrary in this Agreement, we and our Affiliates do not accept, invite or consider unsolicited Publications of ideas, proposals or suggestions. Anything you submit to us is not confidential and you give us the right to use it in the same manner as any other Publication.
                      </p>
                      <br/>

                      <p>
                        <strong>8. Monitoring.</strong> We may, but have no obligation to: (a) monitor, evaluate or alter Publications before or after they appear on the Website; (b) seek to verify that all rights, consents, releases and permissions in or relating to such Publication have been obtained by you in accordance with your representations above; (c) refuse, reject or remove any Publication at any time or for any reason (including, without limitation, if we determine, in our sole discretion, that all rights, consents, releases and permissions have not been obtained by you despite your representations above). We may disclose any Publications and any other related information for any reason or purpose (pursuant to our privacy policy).
                      </p>
                      <br/>

                      <p>
                        <strong>9. Products.</strong> All rights in any products available through the Website, such as music (whether in digital or physical format), ring tones, SMS tones, images, video, artwork, text, software and other copyrightable materials (collectively, the "Products") are owned by us, our Affiliates and licensors. If a separate agreement provided by us or an Affiliate governs a particular Transaction or Product, or your use of a particular Product, and the terms of such separate agreement conflict with the terms of this Agreement, the terms of such separate agreement will govern such transaction or use. Subject to your compliance with the terms and conditions of this Agreement and any other applicable terms and conditions imposed by us, our Affiliates and/or our licensors, you have a limited right to use those Products that you purchase or access through the Website solely for your personal, noncommercial use in accordance with the terms and conditions of this Agreement and any other terms and conditions that may apply to such Products, which right you cannot sublicense to others. Any burning or exporting capabilities, if any, of any Product shall not constitute a grant or waiver of any of our rights or those of any copyright or other rights owners in such Product, any other Product or any content, sound recording, underlying musical composition, artwork or other copyrightable matter embodied in or associated with such Product or any other Product. You understand that the Website and the Products may include and/or rely on a security framework using technology that protects digital information and imposes usage rules established by us, our Affiliates and our (or their) licensors, and you hereby agree to abide by such usage rules, including those set forth below. Unless we expressly provide otherwise, all Transactions, all Products and your use of such Products are subject to this Agreement.
                      </p>
                      <br/>

                      <p>
                        <strong>10. Purchases.</strong> If you wish to purchase any Products made available through the Website (each such purchase, a "Transaction"), you may be asked to supply certain information in connection with such Transaction, including without limitation your credit card number or other payment account number (for example, your wireless account number), your billing address, and your shipping information. By placing an order through this Website, You warrant that You are legally capable of entering into binding contracts; and You are at least 18 years old. If You are under the age of 18 years and/or are not capable of entering into binding contracts but wish to use this Webstore, a parent or guardian should accept these Terms on Your behalf.
                        <br/><br/>
                        Except to the extent prohibited by applicable law, we reserve the right, with or without prior notice, to change such products, descriptions, images, and references; to limit or restrict the amount of anything that you may purchase, to put conditions on the available quantity of any Product; to put any conditions we choose on any coupons, discounts, or promotional codes; to completely bar you from making any transaction. Inertia reserves the right to change the availability and price of its projects without notice or consent. You shall pay all charges that may be incurred by you or on your behalf through the Website, at the price(s) in effect when such charges are incurred, including without limitation all shipping and handling charges, and any applicable network, data or other charges in respect of mobile downloads. In addition, you remain responsible for any taxes (including, if applicable, VAT and/or any import duties) that may be applicable to your Transaction(s).
                        <br/><br/>
                        Except to the extent applicable law provides otherwise, all sales through the Website are final, and all charges from those sales are nonrefundable, except as otherwise expressly set forth in this Agreement. We or our third-party designees may automatically process charges against your selected payment method on the receipt page or when we provide you with a "Download Now" link. We or our third-party designees will inform you if all or any portion of your order is canceled or if additional or different information is required to accept your order.
                      </p>
                      <br/>

                      <p>
                        <strong>11. Product Delivery.</strong> Except to the extent prohibited by applicable law, we reserve the right to change Product delivery options without notice. Except to the extent that applicable law provides otherwise, your sole and exclusive remedy with respect to any Product that is not delivered within a reasonable period will be either replacement of such Product or a refund of the purchase price paid for such Product, as determined by us in our sole discretion.
                      </p>
                      <br/>

                      <p>
                        <strong>12. Usage Restrictions for Products.</strong> All Products you purchase, obtain or access on or through the Website are solely for your personal, non-commercial use. Except as otherwise expressly provided herein, you may not reproduce, publish, transmit, distribute, display, broadcast, re-broadcast, modify, create derivative works from, sell or participate in any sale of or exploit in any way, in whole or in part, directly or indirectly, any of the Products or any related software. Except as permitted under applicable law, you may not reverse engineer, decompile, disassemble, modify or disable any Products or any copyright protection or use limitation systems associated with the Products. You may not play and then re-digitize any Products or upload any Products or derivatives thereof to the Internet. Unless expressly permitted by us, you may not use the Products in conjunction with any other content. You may not transfer, sell or offer to sell the Products, including, without limitation, posting any Product for auction on any Internet auction Website or "trading" the Products for money, goods or services. YOU ARE NOT GRANTED ANY COMMERCIAL SALE, RESALE, REPRODUCTION, DISTRIBUTION OR PROMOTIONAL USE RIGHTS IN CONNECTION WITH PRODUCTS. Additionally, the following usage restrictions apply based on the type of Product you are purchasing or obtaining through the Website:
                      </p>
                      <br/>

                      <p>
                        <strong>13. Product Requirements; Compatibility.</strong> You acknowledge that use of our Products requires other hardware and software tools (e.g., in the case of full permanent audio downloads, for making copies of Products on physical media and rendering performance of Products on authorized digital player devices), and that such hardware and software, including, without limitation, all charges therefor, are your sole responsibility. To the extent permissible under applicable law, we, our Affiliates and our (and their) Artists and Representatives or Partners shall not be responsible or liable for the loss or damage of any Product. Except to the extent prohibited by applicable law, we reserve the right to change at any time, with or without prior notice to you, the software or hardware required to download, transfer, copy and/or use or limit the use of any Products.
                      </p>
                      <br/>

                      <p>
                        <strong>14. Rules for Promotions.</strong> Any contests, offers, giveaways, or other promotions (collectively, "Promotions") made available through the Website may be governed by separate rules. Your participation in any Promotion will be subject to the specific terms of the Promotion in addition to these terms and our Privacy Policy. Any special Promotion terms will apply. If there is a conflict among any Promotion terms with these Terms and Conditions, the Privacy Policy, or any of our other Terms, the Promotion rules will apply.
                      </p>
                      <br/>

                      <p>
                        <strong>15. Our Proprietary Rights.</strong> We, our Artists, our Affiliates and our respective licensors and suppliers own the information and materials made available through the Website. Such information and materials are protected by copyright, trademark, patent and/or other proprietary rights and laws. Except as expressly authorized in advance by us, you agree not to reproduce, modify, rent, lease, loan, sell, distribute or create derivative works based on, all or any part of the Website or any information or materials made available through the Website.
                        <br/><br/>
                        We, our Affiliates and/or our respective licensors or suppliers own the trade names, trademarks and service marks on the Website, including without limitation "Inertia" and any associated logos. All trademarks and service marks on the Website not owned by us, our Artists, or our Affiliates are the property of their respective owners. You may not use our trade names, trademarks and service marks in connection with any product or service that is not ours, or in any manner that is likely to cause confusion. Nothing contained on the Website should be construed as granting any license or right to use any trade names, trademarks or service marks without express prior written consent of the owner.
                        <br/><br/>
                        PLEASE NOTE THAT UNAUTHORIZED USE OF ANY SERVICE OR PRODUCT, INCLUDING, WITHOUT LIMITATION, ANY SOFTWARE USED BY THE SERVICES, MAY SUBJECT YOU TO CIVIL AND CRIMINAL PENALTIES, (INCLUDING, WITHOUT LIMITATION, POSSIBLE MONETARY DAMAGES), INCLUDING, WITHOUT LIMITATION, FOR COPYRIGHT INFRINGEMENT.
                      </p>
                      <br/>

                      <p>
                        <strong>16. Third Party Applications.</strong> The Website may include third party software applications and services (or links thereto) that are made available by our Partners ("Third Party Applications"). Because we do not control Third Party Applications, you agree that neither we nor our Affiliates, nor our respective Artists and Representatives, are responsible or liable for any Third Party Applications, including the performance, accuracy, integrity, quality, legality, usefulness, or safety of, or intellectual property rights relating to, Third Party Applications or their use. We have no obligation to monitor Third Party Applications, and we may remove or restrict access to any Third-Party Applications (in whole or part) from the Website at any time. The availability of Third-Party Applications on the Website does not imply our endorsement of, or our affiliation with any Provider of, such Third-Party Applications. Further, your use of Third-Party Applications may be governed by additional terms and conditions that are not set forth in this Agreement or our Privacy Policy (for example, terms and conditions that are made available by Partners themselves in connection with Third Party Applications). This Agreement does not create any legal relationship between you and Partners with respect to Third Party Applications, and nothing in this Agreement shall be deemed to be a representation or warranty by us, or any of our Affiliates, or our respective Artists, Representatives or Partners, with respect to any Third-Party Application.
                      </p>
                      <br/>

                      <p>
                        <strong>17. Third Party Content.</strong> The Website may incorporate certain functionality that allows, via the system or network of which the Website is a component, the routing and transmission of, and online access to, certain digital communications and content made available by third parties ("Third Party Content"). By using such Website functionality, you acknowledge and agree that you are directing us to access and transmit to you Third Party Content associated with such functionality. Because we do not control Third Party Content, you agree that we are neither responsible nor liable for any Third-Party Content, including the accuracy, integrity, quality, legality, usefulness, or safety of, or intellectual property rights relating to, Third Party Content. We have no obligation to monitor Third Party Content, and we may block or disable access to any Third-Party Content (in whole or part) via the Website at any time. Your access to or receipt of Third-Party Content via the Website does not imply our endorsement of, or our affiliation with any provider of, such Third-Party Content. Further, your use of Third-Party Content may be governed by additional terms and conditions that are not set forth in this Agreement or our Privacy Policy (for example, terms and conditions that are made available by the Partners of such Third-Party Content). This Agreement does not create any legal relationship between you and the Partners of such Third Party Content with respect to such Third Party Content, and nothing in this Agreement shall be deemed to be a representation or warranty by us, or any of our Affiliates, or our respective Artists, Representatives or Partners, with respect to any Third Party Content.
                      </p>
                      <br/>

                      <p>
                        <strong>18. Links and Feeds.</strong> The Website may provide links to other websites and online resources, some related, some owned and controlled by unaffiliated third parties. We and our Affiliates are not responsible for and do not endorse such external Websites or resources. YOUR ACCESS TO AND USE OF THIRD-PARTY WEBSITES, CONTENT AND RESOURCES IS AT YOUR OWN RISK.
                      </p>
                      <br/>

                      <p>
                        <strong>19. Limitations of Liability and Disclaimers.</strong> INERTIA SHALL NOT BE LIABLE FOR ANY DAMAGES OF ANY KIND ARISING FROM THE USE OF THE PRODUCTS, INCLUDING BUT NOT LIMITED TO, A DIRECT, INDIRECT, INCIDENTAL AND/OR CONSEQUENTIAL LOSS, INCLUDING LOST PROFITS, GOODWILL OR ANY OTHER INTANGIBLE LOSS, EVEN IF INERTIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH LOSS. IF YOU ARE AN INDIVIDUAL CONSUMER, THIS MAY NOT APPLY TO YOU AND INSTEAD INERTIA WILL BE LIABLE TO YOU ONLY FOR THE DIRECT AND ACTUAL LOSS SUFFERED BY YOU AND WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL AND/OR CONSEQUENTIAL LOSS, EVEN IF INERTIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH LOSS.
                        <br/><br/>
                        YOU AGREE TO INDEMNIFY INERTIA, ITS AFFILIATES, SUBSIDIARIES, SERVICE PROVIDERS, DISTRIBUTORS, LICENSORS, OFFICERS, DIRECTORS AND EMPLOYEES FROM ANY CLAIM OR DEMAND MADE BY ANY THIRD PARTY DUE TO, ARISING OUT OF OR RELATED TO YOUR BREACH OF THESE TERMS, MISUSE OF THE PRODUCTS, OR YOUR VIOLATION OF ANY APPLICABLE LAW, RULE, REGULATION OR THIRD PARTY RIGHT.
                        <br/><br/>
                        THIS SECTION DOES NOT IN ANY WAY LIMIT OR EXCLUDE INERTIA'S LIABILITY FOR ANY MATTER FOR WHICH IT WOULD BE ILLEGAL FOR INERTIA TO EXCLUDE, OR ATTEMPT TO EXCLUDE, INERTIA'S LIABILITY.
                        <br/><br/>
                        WE DO NOT GUARANTEE THAT THE WEBSITE OR ANY THIRD PARTY APPLICATIONS WILL BE SECURE OR THAT ANY USE OF THE WEBSITE OR ANY THIRD PARTY APPLICATIONS WILL BE UNINTERRUPTED. IF YOU BECOME AWARE OF ANY UNAUTHORIZED THIRD PARTY ALTERATIONS TO THE WEBSITE, CONTACT US PURSUANT TO SECTION 26 BELOW.
                      </p>
                      <br/>

                      <p>
                        <strong>20. Indemnity.</strong> Except to the extent prohibited under applicable law, you agree to defend, indemnify and hold harmless us, our Affiliates and our and their respective Artists, Representatives and Partners, from and against all claims, losses, costs and expenses (including attorneys fees) arising out of (a) your use of, or activities in connection with, the Website; (b) any violation of this Agreement by you; (c) any use or other exploitation, or failure or omission to use or otherwise exploit, any Publication (including any portion thereof) that you post; or (d) any claim that your Publication or any use or exploitation thereof caused damage to or infringed upon or violated the rights of a third party, including without limitation past, present or future infringement, misappropriation, libel, defamation, invasion of privacy or right of publicity or violation of rights related to the foregoing.
                      </p>
                      <br/>

                      <p>
                        <strong>21. Termination.</strong> This Agreement is effective until terminated. We may, at any time and for any reason, terminate your access to or use of: (a) the Website, (b) your username and password or (c) any files or information associated with your username and password. If we terminate your access to the Website, you will not have the right to bring claims against us, our Affiliates or our respective Artists, Representatives and Partners with respect to such termination. We and our Affiliates and our respective Artists, Representatives and Partners, shall not be liable for any limitation or termination of your access to the Website or to any such information or files, and shall not be required to make such information or files available to you after any such termination. Sections 2, 6-8, 15-23, 25-27 and 29 shall survive any expiration or termination of this Agreement.
                      </p>
                      <br/>

                      <p>
                        <strong>22. Governing Law; Dispute Resolution.</strong> You hereby agree that this Agreement (and any claim or dispute arising in connection with this Agreement or your use of the Website) is governed by and shall be construed in accordance with the laws of the State of North Carolina, USA, without regard to its principles of conflicts of law, and you consent to the exclusive jurisdiction of the federal and state courts located in Wake County, North Carolina, U.S.A., and waive any jurisdictional, venue or inconvenient forum objections thereto.
                        <br/><br/>
                        You further agree that the United Nations Convention on the International Sale of Goods will not apply to this Agreement. You agree that any unauthorized use of the Website, the Products or any related software or materials, or any Third Party Applications, would result in irreparable injury to us, our Affiliates or our respective Artists, Representatives and Partners for which money damages would be inadequate, and in such event we, our Affiliates or our respective Artists, Representatives and Partners, as applicable, shall have the right, in addition to other remedies available at law and in equity, to immediate injunctive relief against you. Nothing contained in this section or elsewhere in this Agreement shall be construed to limit remedies or relief available pursuant to statutory or other claims that we, our Affiliates or our respective Artists, Representatives and Partners may have under separate legal authority, including, without limitation, any claim for intellectual property infringement.
                      </p>
                      <br/>

                      <p>
                        <strong>23. Filtering.</strong> Pursuant to 47 U.S.C. Section 230(d) as amended, you are notified that parental controls are available that can allow you to limit access by minors to certain material. The Federal Communications Commission has shared information online about protecting children's privacy and is available at: https://onguardonline.gov/. Inertia's sharing of this information is not an endorsement or affiliation of anything contained in the FCC website.
                      </p>
                      <br/>

                      <p>
                        <strong>24. Information or Complaints.</strong> Under California Civil Code Section 1789.3, California users are entitled to the following consumer rights notice: If you have a question or complaint regarding the Website, please feel free to contact us via e-mail at team@theinertiaproject.com. You may also contact us using the information contained in Section 26. California residents may reach the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs by mail at 1625 North Market Blvd., Sacramento, CA 95834, or by telephone at (916) 445-1254 or (800) 952-5210.
                      </p>
                      <br/>

                      <p>
                        <strong>25. Forward-Looking Statements.</strong> Statements appearing on the Website that concern us, our Affiliates or our and their management and that are not historical facts are "Forward-Looking Statements." Forward-Looking Statements are only predictions, and actual future events may differ materially from those discussed in any Forward-Looking Statement. Various external factors and risks affect our operations, markets, products, services and prices. These factors and risks are described in our current annual report filed with the SEC and in other filings we make with the SEC. You can access our most recent SEC filings via the SEC EDGAR system located at www.sec.gov, or you may obtain these filings directly from us at no charge. We disclaim any obligation or responsibility to update, revise or supplement any Forward-Looking Statement or any other statements appearing on the Website.
                      </p>
                      <br/>

                      <p>
                        <strong>26. Claims of Copyright Infringement.</strong> If you believe in good faith that materials available on the Website infringe any copyright or other intellectual property rights, you (or your agent) may send us a notice requesting that we remove the material or disable access to it. If you believe in good faith that someone has wrongly filed a notice of copyright infringement against you, the Digital Millenium Copyright Act permits you to send us a counter-notice. Notices and counter-notices must meet the then-current statutory requirements imposed by the DMCA. See https://www.copyright.gov for details. Notices and counter-notices should be sent to:
                        <br/><br/>
                        The Inertia Project, Inc.
                        <br/>212 Pine Ridge Ct
                        <br/>Wake Forest, NC 27587
                        <br/>Telephone Number: (443) 766-0839
                        <br/>Email: team@theinertiaproject.com
                        <br/><br/>
                        You should consult your legal advisor before filing a notice or counter-notice.
                      </p>
                      <br/>

                      <p>
                        <strong>27. Ability to Enter Into This Agreement.</strong> By using the Website, you affirm that you are of legal age to enter into this Agreement or, if you are not, that you have obtained parental or guardian consent to enter into this Agreement.
                      </p>
                      <br/>

                      <p>
                        <strong>28. Contact Us.</strong> If you have any questions regarding the meaning or application of this Agreement, please direct such questions to team@theinertiaproject.com.
                      </p>
                      <br/>

                      <p>
                        <strong>29. Miscellaneous.</strong> These Terms, together with any documents or links to other terms referred to herein, constitute the whole Agreement between You and us supersede and extinguish any prior understandings, agreements or terms between You and us. The rights and remedies provided in these Terms are cumulative and are not exclusive of any rights and remedies provided by law or otherwise. No breach by either You or Inertia of any provision of these Terms shall be waived or discharged except with the express written consent of the other. No failure or delay by either You or Inertia in exercising any right, power or privilege under these Terms shall operate as a waiver of that right, power or privilege and no single or partial exercise by either You or Inertia of any right, power or privilege shall preclude any further exercise of that right, power or privilege or the exercise of any other right, power or privilege. These Terms shall be binding on and endure for the benefit of each party's successors in title. The views and opinions expressed on this Webstore do not necessarily reflect those of Inertia, its Affiliates, and Partners.
                      </p>
                      <br/>

                      <p>
                        <strong>This is the final paragraph.</strong> By scrolling to this point, you enable the checkbox to agree to these terms.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" className="bg-[#CB945E] hover:bg-[#CB945E]/90">Close</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90" disabled={isLoading || !termsAgreed}>
            {isLoading ? 'Creating Account...' : inviteToken ? 'Claim Artist Account' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-white">
          Already have an account?{" "}
          <Link href="/login" className="underline text-gray-300 hover:text-white">
            Login
          </Link>
        </div>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </CardContent>
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <main className="flex-1 flex items-center justify-center py-12">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </main>
  );
}