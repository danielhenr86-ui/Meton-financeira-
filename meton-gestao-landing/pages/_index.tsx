import React from "react";
import { ArrowRight, Check, Instagram, MessageCircle } from "lucide-react";
import { Button } from "../components/Button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/Accordion";
import { FeatureCatalog } from "../components/FeatureCatalog";
import { useScrollReveal } from "../helpers/useScrollReveal";
import styles from "./_index.module.css";

const WHATSAPP_BASE = "https://wa.me/5562994738787";
const whatsappUrl = (message: string) => `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;

const plans = [
  {
    name: "Start",
    price: "149",
    description: "Para organizar os controles essenciais da operação.",
    fit: "Entrada",
    features: [
      "Cadastros e estrutura comercial",
      "Vendas, pedidos e orçamentos",
      "Financeiro essencial",
      "Compras e estoque essencial",
      "Relatórios operacionais",
      "Suporte MetOn",
    ],
    cta: "Escolher Start",
    message: "Olá! Quero conhecer o plano Start da MetOn Gestão por R$ 149/mês.",
  },
  {
    name: "Pro",
    price: "199",
    description: "Para operar com mais automação, indicadores e controle.",
    fit: "Melhor custo-benefício",
    features: [
      "Tudo do Start",
      "Financeiro completo + conciliação",
      "Serviços e ordens de serviço",
      "Indicadores e DRE ampliados",
      "Integração contábil automatizada",
      "Automação e suporte prioritário",
    ],
    cta: "Escolher Pro",
    message: "Olá! Quero contratar o MetOn Gestão Pro por R$ 199/mês. Pode me explicar a implantação?",
    featured: true,
  },
  {
    name: "Business",
    price: "299",
    description: "Para empresas que precisam de visão executiva e acompanhamento próximo.",
    fit: "Avançado",
    features: [
      "Tudo do Pro",
      "Leitura executiva dos indicadores",
      "Configuração avançada da operação",
      "Acompanhamento consultivo",
      "Prioridade máxima no suporte",
      "Orientação estratégica de uso",
    ],
    cta: "Escolher Business",
    message: "Olá! Quero conhecer o plano Business da MetOn Gestão por R$ 299/mês.",
  },
];

const faqs = [
  {
    question: "Todas as funcionalidades estão em todos os planos?",
    answer: "Não. A disponibilidade de módulos, documentos fiscais, integrações e serviços varia conforme o plano, o segmento e a configuração da empresa. A composição é validada antes da contratação.",
  },
  {
    question: "O sistema funciona no celular?",
    answer: "Sim. O acesso é web e responsivo, podendo ser utilizado em computador, tablet e celular.",
  },
  {
    question: "O suporte está incluído?",
    answer: "Sim. Todos os planos possuem suporte MetOn. O nível de prioridade e acompanhamento aumenta conforme o plano contratado.",
  },
  {
    question: "Há implantação e migração de dados?",
    answer: "Sim, conforme a necessidade da operação. Escopo, migração e configurações específicas são validados antes do início.",
  },
];

function TargetMark() {
  return (
    <span className={styles.targetMark} aria-hidden="true">
      <span className={styles.targetMid}>
        <span className={styles.targetDot} />
      </span>
    </span>
  );
}

function Brand() {
  return (
    <a href="#top" className={styles.brand} aria-label="MetOn Gestão - início">
      <span className={styles.brandWord}><span>Met</span><span>On</span></span>
      <span className={styles.brandTag}>GESTÃO</span>
    </a>
  );
}

export default function HomePage() {
  const revealPricing = useScrollReveal();
  const revealFaq = useScrollReveal();
  const revealFinal = useScrollReveal();

  return (
    <main id="top" className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Brand />
          <nav className={styles.nav} aria-label="Navegação principal">
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#segmentos">Segmentos</a>
            <a href="#planos">Planos</a>
          </nav>
          <Button asChild size="md" className={styles.headerCta}>
            <a href={whatsappUrl("Olá! Quero conhecer a MetOn Gestão.")} target="_blank" rel="noreferrer">
              Falar no WhatsApp <ArrowRight size={16} />
            </a>
          </Button>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>Sistema de gestão empresarial</div>
            <h1>Vendas, financeiro, estoque, serviços e fiscal. <span>Em um só lugar.</span></h1>
            <p className={styles.heroLead}>
              Gerencie a operação da empresa com recursos para vendas, compras, estoque, financeiro, documentos fiscais, ordens de serviço, relatórios e integração contábil.
            </p>

            <div className={styles.quickFeatures}>
              <span><Check size={15} /> NF-e, NFC-e e NFS-e</span>
              <span><Check size={15} /> Financeiro e DRE</span>
              <span><Check size={15} /> Estoque e compras</span>
              <span><Check size={15} /> OS e técnicos</span>
              <span><Check size={15} /> Pix, boletos e cobranças</span>
              <span><Check size={15} /> Relatórios e contabilidade</span>
            </div>

            <div className={styles.heroActions}>
              <Button asChild size="lg" className={styles.heroPrimary}>
                <a href={whatsappUrl("Olá! Quero conhecer as funcionalidades da MetOn Gestão e entender qual plano atende minha empresa.")} target="_blank" rel="noreferrer">
                  <MessageCircle size={19} /> Quero conhecer
                </a>
              </Button>
              <a className={styles.textLink} href="#funcionalidades">Ver funcionalidades <ArrowRight size={17} /></a>
            </div>
          </div>

          <div className={styles.heroVisual} aria-label="Símbolo visual MetOn">
            <div className={styles.visualGlow} />
            <div className={styles.targetStage}><TargetMark /></div>
            <div className={styles.metricCard + " " + styles.metricOne}>
              <span>MÓDULOS</span>
              <strong>Integrados</strong>
              <small>operação centralizada</small>
            </div>
            <div className={styles.metricCard + " " + styles.metricTwo}>
              <span>ACESSO</span>
              <strong>100% web</strong>
              <small>computador, tablet e celular</small>
            </div>
          </div>
        </div>
        <div className={styles.heroStrip}>
          <span>VENDAS</span><i />
          <span>SERVIÇOS</span><i />
          <span>FINANCEIRO</span><i />
          <span>FISCAL & ESTOQUE</span><i />
          <span>RELATÓRIOS</span>
        </div>
      </section>

      <FeatureCatalog />

      <section id="planos" className={styles.pricingSection} ref={revealPricing}>
        <div className={styles.pricingIntro}>
          <span className={styles.kicker}>Planos</span>
          <h2>Escolha o nível de gestão.</h2>
          <p><strong>Pro</strong> é o plano de melhor custo-benefício para empresas que querem mais automação e controle.</p>
        </div>
        <div className={styles.pricingGrid}>
          {plans.map((plan) => (
            <article key={plan.name} className={`${styles.priceCard} ${plan.featured ? styles.priceFeatured : ""}`}>
              {plan.featured && <div className={styles.featuredBadge}>MELHOR CUSTO-BENEFÍCIO</div>}
              <div className={styles.planTop}>
                <h3>{plan.name}</h3>
                <span className={styles.planFit}>{plan.fit}</span>
                <p>{plan.description}</p>
              </div>
              <div className={styles.priceLine}>
                <span>R$</span><strong>{plan.price}</strong><small>/mês</small>
              </div>
              <ul>
                {plan.features.map((feature) => <li key={feature}><Check size={17} /> {feature}</li>)}
              </ul>
              <Button asChild size="lg" variant={plan.featured ? "primary" : "outline"} className={plan.featured ? styles.planPrimary : styles.planSecondary}>
                <a href={whatsappUrl(plan.message)} target="_blank" rel="noreferrer">
                  {plan.cta} <ArrowRight size={17} />
                </a>
              </Button>
              {plan.featured && <small className={styles.planHint}>R$ 50 a mais que o Start.</small>}
            </article>
          ))}
        </div>
        <p className={styles.pricingNote}>Módulos, documentos fiscais, integrações e recursos específicos podem variar conforme plano, segmento, homologação e configuração da operação.</p>
      </section>

      <section className={styles.faqSection} ref={revealFaq}>
        <div className={styles.faqIntro}>
          <span className={styles.kicker}>Dúvidas rápidas</span>
          <h2>Antes de contratar.</h2>
        </div>
        <div className={styles.faqPanel}>
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem value={`faq-${index}`} key={faq.question} className={styles.faqItem}>
                <AccordionTrigger className={styles.faqTrigger}>{faq.question}</AccordionTrigger>
                <AccordionContent className={styles.faqContent}>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className={styles.finalCta} ref={revealFinal}>
        <div className={styles.finalTarget}><TargetMark /></div>
        <div className={styles.finalCopy}>
          <span className={styles.kicker}>MetOn Gestão</span>
          <h2>Veja o sistema aplicado à sua empresa.</h2>
          <p>Fale com a MetOn, informe seu segmento e receba a indicação de módulos e plano mais adequados.</p>
          <div className={styles.finalActions}>
            <Button asChild size="lg" className={styles.finalPrimary}>
              <a href={whatsappUrl("Olá! Quero ver a MetOn Gestão aplicada ao meu negócio e receber a indicação do melhor plano.")} target="_blank" rel="noreferrer">
                <MessageCircle size={20} /> Falar com vendas
              </a>
            </Button>
            <a className={styles.instagramLink} href="https://www.instagram.com/metoninteligencia/" target="_blank" rel="noreferrer">
              <Instagram size={19} /> @metoninteligencia
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <Brand />
        <div className={styles.footerContact}>
          <span>Vendas e Suporte</span>
          <a href={whatsappUrl("Olá! Preciso falar com a MetOn Gestão.")} target="_blank" rel="noreferrer">(62) 99473-8787</a>
        </div>
        <a href="https://www.instagram.com/metoninteligencia/" target="_blank" rel="noreferrer" className={styles.footerInstagram}><Instagram size={17} /> @metoninteligencia</a>
        <p>MetOn Gestão · Sistema de gestão empresarial.</p>
      </footer>

      <a className={styles.mobileWhats} href={whatsappUrl("Olá! Quero conhecer a MetOn Gestão.")} target="_blank" rel="noreferrer">
        <MessageCircle size={20} /> Falar no WhatsApp
      </a>
    </main>
  );
}
