---
title: "Beli Feature Intro: Eaters Like You"
date: "2026-07-01"
thumbnail: "/projects/beli/beli_thumbnail.png"
description: "Redesigning a food-review app by introducing a new feature that accomodates users with dietary restrictions better."
featured: true
protected: false
prototypeUrl: "https://www.figma.com/proto/JDZJoi1HqERbmshMni5KxY/COGS-127-Beli-Redesign?node-id=445-1131&t=8zTkAcWyJxaObZGJ-1"
duration: "Ten Weeks"
role: "UX Researcher and Designer"
---

# Overview

Eating out is one of the most common ways people socialize, celebrate, and connect with others. For people with dietary restrictions, however, that same experience can become stressful, isolating, and mentally exhausting. When someone is navigating dietary restrictions, finding a restaurant often requires significantly more effort than simply choosing somewhere that looks good.

My team- **Zoe Kothari, Kalyani Joshi, and Sonakshi Mohanty**- was especially interested in this problem because three out of four of our team members are vegetarians due to cultural backgrounds, and all of us have close relationships with people managing allergies, intolerances, or chronic dietary needs. Through our own experiences, we noticed that restaurant discovery for people with dietary restrictions is not only a logistical issue - it is also a social one, since many people with dietary restrictions feel uncomfortable suggesting restaurants in group settings or worry about being perceived as difficult.

While researching this space, we found that many people rely on a fragmented combination of apps, restaurant websites, social media posts, and online reviews just to feel confident choosing a place to eat. Even platforms built around restaurant discovery and recommendations, such as Beli, are primarily optimized for users without restrictions, leaving those with them to manually scan menus, cross-reference reviews, or search for information outside the app entirely.

We wanted to explore how restaurant discovery platforms could better support confidence, transparency, and community-driven trust for users with dietary restrictions. Since Beli already centers around social recommendations and shared food experiences, we saw an opportunity to rethink how dietary-aware restaurant discovery could feel more inclusive, personalized, and socially validating without separating users into a completely different experience.

Our project asks:
> How might we help people with dietary restrictions feel more confident and included during the restaurant discovery process?

# User Research

To better understand how people with dietary restrictions currently discover restaurants, we conducted semi-structured interviews with participants managing a range of dietary needs, including severe allergies, gluten and dairy intolerances, halal dietary restrictions, and vegetarian diets.

Because three members of our team personally belong to this user group, we entered the research with some familiarity around the challenges of eating out with restrictions. However, we wanted to better understand how different types of dietary needs shaped:

- restaurant search behaviors
- trust in recommendations
- confidence during decision-making
- and feelings throughout the dining process

Participants were asked to walk us through a realistic restaurant discovery task using the apps and tools they already rely on, including Beli, Google Maps, TikTok, Instagram, and other resources they find useful. During the task, participants searched for a restaurant in San Diego that would work both for their dietary restrictions and for a group dining setting.

![Restaurant dicovery task](/projects/beli/discovery_task.png)

We specifically focused on:

- how users determine whether a restaurant feels safe or accommodating
- what information they trust most
- where uncertainty appears in the process
- and what parts of restaurant discovery feel frustrating versus validating

As interviews progressed, we noticed that participants were not simply searching for restaurants — they were constantly trying to reduce uncertainty and confirm whether they could trust the information they were seeing.

# Research Findings

![Research Findings Infographic](/projects/beli/research_findings.png)

### Users Constantly Cross-Referenced Multiple Platforms

One of the clearest patterns across interviews was that no participant relied on a single platform when choosing a restaurant. Instead, users moved between Google Maps, restaurant websites, TikTok, Instagram, Reddit, and specialized apps to verify whether a restaurant would accommodate their needs.

Aya, who follows a halal diet, described constantly switching between Google Maps, restaurant websites, Instagram pages, and the halal verification app Zabihah just to confirm whether a restaurant was halal. She explained her frustrations, saying:
> “I wish that I didn’t have to go to a separate app to verify if [a restaurant] was halal or not.”

Similarly, Maya searched Google first, then manually checked restaurant menus and social media pages to verify gluten-free and dairy-free options. Sahana also left Beli entirely during the task to inspect restaurant menus on external websites because allergen information was unavailable within the app itself.

This fragmentation made the discovery process feel repetitive and mentally exhausting. Participants described restaurant research as extra “work” rather than something enjoyable.

**Our conclusion: Users did not trust restaurant discovery apps alone to provide enough information to make confident dining decisions.**

### Trust Came From Shared Dietary Experience (Crowdsourced Information)

Participants consistently trusted reviews and recommendations from people with similar dietary restrictions more than general restaurant ratings.

Sahana, who has a severe nut allergy, explained that she would trust allergy-related reviews from other users with allergies because:
> “Someone else is scared for their well-being the same way you are.”

Aya similarly emphasized the importance of community validation and crowdsourced reassurance when determining whether a restaurant was truly halal. Maya mentioned that she trusted Reddit discussions from users with dietary restrictions because those reviews were often more descriptive about ingredient substitutions, accommodations, and restaurant flexibility.

Across interviews, participants cared less about whether a restaurant was “popular” and more about whether someone with similar dietary needs had successfully eaten there before.

This was especially important because many participants felt that people without dietary restrictions often “don’t know what to look out for” when writing reviews.

**Our conclusion: Shared dietary experience created stronger trust signals than traditional restaurant ratings or generic reviews.**

### Missing Information Created Immediate Uncertainty

Another major finding was how quickly participants lost confidence when dietary information was unclear, incomplete, or inconsistent.

Maya immediately abandoned restaurants when menus lacked gluten-free or dairy-free labels because she did not want to guess which dishes were safe. She explained that even when Google search results suggested a restaurant had gluten-free options, she still would not trust the restaurant unless the menu itself clearly labeled items.

Aya expressed frustration when restaurants failed to clearly state whether they were halal on their websites or social media pages, saying:
> “Why are you making this so hard for me to find out?”

Sahana also struggled with the lack of allergen indicators on both restaurant menus and Beli itself, especially around nut allergies and cross-contamination concerns.

Participants repeatedly described how small gaps in information forced them into additional research, uncertainty, or compromise. In many cases, unclear labeling caused users to abandon restaurants entirely rather than risk choosing incorrectly.

**Our Conclusion: Clear, visible dietary information was essential for confidence. Missing information immediately created distrust and hesitation.**

# Our Redesigns

### Onboarding- Designing for Nuanced Dietary Needs

One of the first pain points we identified during user research was that dietary needs are rarely simple or represented by a single label. During research, participants frequently described needing much more specificity than existing apps allowed. One participant with gluten and dairy intolerance explained that even restaurants labeled “gluten-free friendly” still required additional investigation into ingredients and substitutions before she felt comfortable dining there. Participants also often described their restrictions as layered, personal, and difficult to communicate through existing restaurant discovery apps.

To address this, we redesigned the dietary onboarding flow to support both broader lifestyle diets and ingredient-specific restrictions. Rather than treating dietary preferences as a single selection, we separated them into two systems:
- **Lifestyle-based restrictions** tied to culture, ethics, religion, or long-term eating patterns (such as halal, kosher, vegan, vegetarian, gluten-free, or low FODMAP).
- **Ingredient-level preferences** for allergies, intolerances, and highly specific avoidances.

<figure style="margin:2em 0">
  <img src="/projects/beli/onboarding_figure.png" alt="Onboarding Flow" style="width:100%; border-radius:10px"/>
  <figcaption style="font-size:14px; opacity:0.6; margin-top:8px; text-align:left">Beli's Current Onboarding → Redesign Version 1 → Redesign Version 2</figcaption>
</figure>

We explored two onboarding directions. The first emphasized comprehensiveness by introducing separate tabs for lifestyles and ingredients upfront, allowing users to build a detailed dietary profile immediately. To reduce cognitive overload, selected restrictions appeared as removable chips at the top of the screen, giving users constant visibility into their choices while keeping the interaction lightweight and editable.

The second direction focused on approachability and emotional tone. Instead of immediately presenting users with an extensive checklist, the flow prioritized broader lifestyle selection first, followed by ingredient-level customization afterward. We paired these options with rich food imagery to make onboarding feel less clinical and more aligned with the excitement and social enjoyment of discovering food. A searchable ingredient system also gave users flexibility to quickly add highly specific avoidances without scrolling through long lists.

Across both directions, we intentionally maintained visual consistency with Beli’s existing design system by preserving the app’s color palette, interaction patterns, and lightweight interface language. Our goal was not to create a separate “dietary mode,” but to make dietary personalization feel naturally integrated into the core onboarding experience.

### Eaters Like You- Building Trust Through Shared Dietary Experience

One of the strongest insights from our research was that participants trusted recommendations from people with similar dietary restrictions significantly more than generic restaurant ratings or influencer content. Users repeatedly explained that shared dietary experiences created a stronger sense of confidence because those reviewers understood the same risks, limitations, and considerations they personally navigated.

This insight became the foundation for a completely new feature we introduced called “Eaters Like You.”

The feature reimagines restaurant discovery as a community-driven experience centered around dietary compatibility and trust. Instead of only discovering restaurants through general popularity or friend activity, users can now discover recommendations from people whose dietary needs closely align with their own.

<figure style="margin:2em 0">
  <img src="/projects/beli/ely_v1v2.png" alt="Onboarding Flow" style="width:100%; border-radius:10px"/>
  <figcaption style="font-size:14px; opacity:0.6; margin-top:8px; text-align:left"> Eaters Like You Version 1 and 2 </figcaption>
</figure>

When entering the page, users are shown profiles of other eaters filtered by shared dietary restrictions and compatibility scores. Additional filters such as city, cuisine preferences, or specific restrictions allow users to narrow recommendations even further. The experience was designed to feel exploratory and social rather than transactional, encouraging users to discover both new restaurants and new people with similar dining experiences.

We explored multiple ways of visualizing trust and compatibility throughout the interface. One direction emphasized dietary match scores, showing how closely another user’s dietary profile aligned with your own. Restaurants could then display multiple scores reflecting:
- overall restaurant quality
- dietary compatibility
- and trust from users with similar restrictions

Another direction focused more heavily on surfacing recommendations directly from similar users’ restaurant histories and saved lists. However, while testing the layout internally, we realized some users might misinterpret these restaurant cards as another user’s personal favorites rather than recommendations personalized for the current user. This became an important usability consideration moving forward.

### Making Dietary Compatibility Visible

<div style="display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center; margin:2em 0">
  <div>
    <video autoplay loop muted playsinline style="width:100%; height:600px; border-radius:10px; margin:1.6em 0">
  <source src="/projects/beli/user_profile.mp4" type="video/mp4" />
  </video>
  </div>
  <div>

  To support the new “Eaters Like You” ecosystem, we redesigned user profiles to make dietary compatibility more transparent and easier to evaluate at a glance.

  At the top of the profile, we replaced the original “Taste Match” indicator with a Dietary Match score that reflects compatibility between two users’ dietary profiles. Restriction icons are also surfaced directly within the bio, allowing users to immediately recognize shared dietary experiences before deciding whether to follow someone.

  Further down the profile, we introduced a dedicated “Your Dietary Match” section that breaks compatibility into more detailed categories. This section was designed to make trust more explainable and actionable. Instead of presenting compatibility as a vague percentage, users can understand why another person may be a valuable source of recommendations.
  </div>
</div>

# User Testing and Iteration

After developing two high-fidelity design directions, we returned to the same participants from our initial research phase to evaluate how well our solutions addressed the challenges they had previously described. Since these participants had already shared their experiences navigating dietary restrictions, they were positioned to tell us whether our designs genuinely improved the restaurant discovery process or introduced new complexity.

Participants reviewed both versions of our redesigned onboarding flow, the new "Eaters Like You" experience, and the redesigned user profile pages. We encouraged them to think aloud as they interacted with the prototypes and explain what felt intuitive, confusing, useful, or unnecessary.

Rather than determining a single "winning" prototype, our goal was to understand which design decisions best supported confidence, trust, and ease of use during restaurant discovery.

<figure style="margin:2em 0">
  <img src="/projects/beli/redefining_user_flows.png" alt="Redefining User Flow" style="width:100%; border-radius:10px"/>
  <figcaption style="font-size:14px; opacity:0.6; margin-top:8px; text-align:left"> Redefining our user flow </figcaption>
</figure>

One of the clearest findings from testing was that users valued simplicity during onboarding. While participants appreciated the flexibility and personalization offered by both versions, they consistently gravitated toward the cleaner, more minimalist structure of Version 1.

Participants described Version 1's onboarding as easier to scan, less visually overwhelming, and more efficient for completing a setup task. Two users specifically appreciated being able to view more dietary options at once rather than navigating through large image cards or multiple screens.

At the same time, participants also highlighted opportunities to improve clarity. The term "Lifestyles" was initially confusing for one user, who was unsure whether it referred to cultural diets, medical diets, ethical diets, or something else entirely. Others felt that the selected restriction icons shown during onboarding would be easier to understand if they included written labels alongside the icons.

These comments reinforced an important lesson: 
> While dietary restrictions can be highly nuanced, users still want the process of communicating those restrictions to feel quick and effortless.

The strongest feedback emerged around the new "Eaters Like You" feature. Across all participants, Version 2 was consistently preferred because it focused on helping users discover restaurants first rather than asking them to discover other users. Participants felt this aligned more closely with their actual goals when opening Beli.

One participant explained that they would be far more likely to use the feature if restaurant recommendations were immediately visible alongside reviews from users with similar dietary restrictions. Another suggested displaying how many similar eaters had reviewed a restaurant because the volume of matching reviews would increase trust and credibility.

This feedback contributed to one of our core research findings: users care less about finding strangers online and more about finding restaurants they can confidently eat at. 
> Shared dietary experiences only become valuable when they directly help users make dining decisions.

Our final direction thus became clear:

> Create the fastest and most understandable way for users to communicate their dietary needs, then use those preferences to surface trustworthy restaurant recommendations from people with similar dietary experiences.

# Final Designs

### Onboarding

Since our tests revealed that users preferred a simple checklist onboarding process, we updated our flow to better fit this process- rather than using simply a toggle to input both lifestyle and ingredient restrictions, we adapted it into a process that takes users' through both, ensuring that they do not accidentally miss inputting important information. Based on feedback, we also added a confirmation screen that displays selected restrictions using both icons and written labels, making profiles easier to review and reducing ambiguity.

<figure style="margin:2em 0">
  <img src="/projects/beli/onboarding_before_after.png" alt="Onboarding before-and-after" style="width:100%; border-radius:10px"/>
  <figcaption style="font-size:14px; opacity:0.6; margin-top:8px; text-align:left"> Onboarding before-and-after </figcaption>
</figure>

<div style="display:grid; grid-template-columns:1fr 1fr; gap:32px; align-items:center; margin:2em 0">
  <div>
    <img src="/projects/beli/toggles.png" alt="Toggles" style="width:100%; border-radius:10px" />
  </div>
  <div>
    <p>We also spent quite a bit of time debating the best way to display our Lifestyle/Ingredient toggle, keeping in mind that it would need to be a feature that looked both a part of the onboarding process, as well as an interactive element that users could actively switch between. While our original version had pill icons, one users mentioned it could be a little confusing (especially for older users) who wouldn't necessarily think to toggle between the two. We explored versions that incorporated numbered labels ("1. Lifestyles" and "2. Ingredients"), which more clearly communicated that users were expected to complete both sections as part of the onboarding process. We also experimented with connected step indicators, borrowing a pattern seen in many multi-step forms.</p>
    <p>In the end, we ended up using a simple numbered label to convey the steps of the process, while retaining the color differences to help more tech-savvy users understand that the toggle was interactive. </p>
  </div>
</div>

### Eaters Like You

Since Eaters Like You was a whole new feature, our test users did not have many bases of comparison to offer us exhaustive insight on improvements. So, we honed in on really improving the specifics of our Eaters Like You feed. Based on user inputs, we increased the size of our dietary restriction icons in user descriptions, and also highlighted keywords in each of their reviews so they were more salient on quick glances.

<figure style="margin:2em 0">
  <img src="/projects/beli/ely_before_after.png" alt="Eaters Like You before-and-after" style="width:100%; border-radius:10px"/>
  <figcaption style="font-size:14px; opacity:0.6; margin-top:8px; text-align:left"> Eaters Like You before-and-after </figcaption>
</figure>

# Reflection

This project changed how I think about accessibility and inclusion in product design.

When we began, I assumed the primary challenge would be helping users find dietary information more efficiently. I expected our solution to focus on filters, labels, and restaurant data. While those elements were important, our research revealed that the real problem was much more human. Participants were not simply looking for food they could eat; they were looking for confidence and reassurance in the discovery process to ensure they wouldn't feel excluded while finding places to eat at.

One of the most surprising insights was how much trust mattered. Several participants explained that they trusted recommendations from people with similar dietary restrictions more than general restaurant ratings or even recommendations from friends without those restrictions. This shifted my perspective on the role of community in product design. Rather than treating dietary accommodations as an isolated feature, we began thinking about how trust could be designed into the discovery process itself.

The project also taught me the importance of balancing comprehensiveness with simplicity. Throughout the design process, we continually debated how much information users should provide and how much information we should surface. User testing reinforced that even when users have complex dietary needs, they still want interactions to feel fast, intuitive, and lightweight. Some of our most ambitious ideas  became simpler because participants consistently valued clarity over complexity.

Working within an existing product ecosystem was another valuable challenge. Because we were extending Beli rather than creating a new platform from scratch, every design decision required us to balance our own innovations with design consistency. We had to consider how new features would fit within Beli’s visual language, interaction patterns, and overall product goals. This pushed me to think beyond individual screens and consider how design decisions contribute to a larger product experience.

Most importantly, this project reminded me that accessibility is not only about accommodating edge cases. Many of the challenges our participants described affected where they could socialize, how they interacted with friends, and whether they felt comfortable participating in shared experiences. Designing for these users was not just about helping them avoid certain foods, but helping them feel included.

Ultimately, this project reinforced a lesson I hope to carry into future work: the most impactful design opportunities often emerge when we look beyond functional problems and understand the emotional experiences underneath them.
