import React from "react";
import {
  BarChart3,
  Boxes,
  Building2,
  Check,
  Cloud,
  CreditCard,
  FileText,
  Landmark,
  MonitorSmartphone,
  PackageCheck,
  ReceiptText,
  Settings2,
  ShoppingCart,
  Truck,
  UtensilsCrossed,
  WalletCards,
  Wrench,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./Accordion";
import { useScrollReveal } from "../helpers/useScrollReveal";
import styles from "./FeatureCatalog.module.css";

type FeatureSection = {
  title: string;
  items: string[];
  note?: string;
};

type Solution = {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  sections: FeatureSection[];
};

const solutions: Solution[] = [
  {
    number: "01",
    title: "Vendas & Comercial",
    description: "Da pré-venda ao documento fiscal, organize atendimento, pedidos, clientes, vendedores e movimentações comerciais.",
    icon: ShoppingCart,
    sections: [
      {
        title: "Movimentações, vendas e compras",
        items: [
          "Pré-venda",
          "Emissão de NFC-e",
          "Emissão de NF-e",
          "Emissão de NFPe",
          "Gerenciamento das vendas realizadas",
          "Lançamento de compras",
          "Importação de compras por XML",
          "Fator de conversão na entrada de mercadorias",
          "Orçamentos",
          "Orçamento digital com autorização do cliente",
          "Pedidos",
          "Condicional de mercadorias",
          "Monitor de NF-e",
          "Manifestação e consulta de documentos emitidos contra o CNPJ",
          "Atendimento",
          "Ordem de produção",
          "Ordem de compra",
          "Cancelamento de vendas e documentos",
          "Download de XML",
          "Histórico de vendas e clientes",
          "Relatórios de movimentações",
        ],
      },
      {
        title: "Cadastros e estrutura comercial",
        items: [
          "Gestão de clientes",
          "Cadastro de pessoas",
          "Clientes",
          "Fornecedores",
          "Transportadoras",
          "Cadastro de produtos",
          "Cadastro tributário dos produtos",
          "Unidades de medida",
          "Grupos de produtos",
          "Kits de produtos",
          "Variações",
          "Usuários e usuários ilimitados",
          "Vendedores",
          "Comissões de vendedores",
          "Cadastro do contador",
          "Parcelamentos",
          "Lista de preços",
          "Terminal de consulta",
          "Relatórios cadastrais",
        ],
      },
    ],
  },
  {
    number: "02",
    title: "Serviços & Operações",
    description: "Controle execução, equipes técnicas, ordens de serviço, faturamento e operações especializadas em um fluxo único.",
    icon: Wrench,
    sections: [
      {
        title: "Serviços, ordens de serviço e NFS-e",
        items: [
          "Cadastro de serviços",
          "Ordem de Serviço — OS",
          "OS simplificada",
          "Emissão de NFS-e",
          "Cadastro e gestão de técnicos",
          "Atribuição de técnicos às ordens",
          "Controle de horários",
          "Objetos vinculados à OS",
          "Identificadores",
          "Produtos utilizados na OS",
          "Serviços utilizados na OS",
          "Contratos",
          "Tributações dos serviços",
          "Configurações específicas de serviços",
          "Lista de preços",
          "Faturamento integrado",
          "Impressão da OS",
          "Versão digital da OS",
          "Autorização digital",
          "Relatórios por cliente",
          "Relatórios por técnico",
          "Relatórios por objeto",
          "Relatórios por período",
        ],
      },
      {
        title: "Logística e transporte",
        items: ["Cadastro de veículos", "Cadastro de motoristas", "Emissão e gerenciamento de MDF-e"],
      },
      {
        title: "Restaurante e alimentação",
        items: [
          "Ambientes e mesas",
          "Garçom",
          "Caixa",
          "Bar",
          "Cozinha",
          "Cardápio digital",
          "Pedidos digitais",
        ],
      },
    ],
  },
  {
    number: "03",
    title: "Financeiro & Gestão",
    description: "Concentre caixa, contas, bancos, cobranças, conciliação e indicadores para transformar movimentação em decisão.",
    icon: WalletCards,
    sections: [
      {
        title: "Financeiro",
        items: [
          "Movimento de caixa",
          "Entradas e saídas",
          "Contas a receber",
          "Contas a pagar",
          "Crédito de clientes",
          "Cadastro de contas bancárias",
          "Bancos",
          "Conciliação bancária",
          "Conciliação automática com recebimentos digitais",
          "Conta digital",
          "Plano de contas",
          "DRE",
          "Metas",
          "Links de pagamento",
          "Link de pagamento via Pix",
          "QR Code Pix",
          "Geração de boletos",
          "Envio de boletos",
          "Baixa e conciliação dos boletos",
          "Recibos",
          "Carnês",
          "Controle de inadimplência",
          "Relatórios financeiros",
        ],
      },
      {
        title: "Relatórios e gestão",
        items: [
          "DRE",
          "Fluxo e movimentação de caixa",
          "Resumo detalhado de vendas",
          "Contas a receber",
          "Contas a pagar",
          "Movimentação do item",
          "Inventário",
          "Histórico do cliente",
          "Lista de preços",
          "Relatórios de OS",
          "Relatórios por técnico",
          "Relatórios por objeto",
          "Relatórios por cliente",
          "Relatórios por período",
          "SPED",
          "Sintegra",
          "Outros relatórios personalizados",
        ],
      },
    ],
  },
  {
    number: "04",
    title: "Fiscal, Estoque & Contabilidade",
    description: "Estruture produtos, estoque, documentos fiscais, tributações e arquivos para manter operação e contabilidade mais conectadas.",
    icon: ReceiptText,
    sections: [
      {
        title: "Estoque e movimentação de itens",
        items: [
          "Gestão de estoque",
          "Inventário",
          "Movimentação de itens",
          "Cadastro de produtos",
          "Grupos de produtos",
          "Kits de produtos",
          "Variações",
          "Unidades de medida",
          "Fator de conversão na entrada de mercadorias",
        ],
      },
      {
        title: "Fiscal e configurações tributárias",
        items: [
          "Emitente",
          "Certificado digital A1",
          "Ambiente",
          "Naturezas",
          "Tributações",
          "Perfil tributário",
          "Configurações gerais",
          "Arquivos contábeis",
          "Assinatura",
          "Configurações de boletos",
          "NF-e",
          "NFC-e",
          "NFPe",
          "NFS-e",
          "MDF-e",
          "Monitor de NF-e",
          "Manifestação de documentos",
          "Consulta de documentos emitidos contra o CNPJ",
          "Download de XML",
        ],
      },
      {
        title: "Contabilidade e obrigações acessórias",
        items: [
          "Cadastro do contador",
          "Arquivos contábeis",
          "Configuração de envio automático para a contabilidade",
          "Definição de destinatários",
          "Definição de periodicidade",
          "Geração automática do pacote",
          "Histórico de execuções",
          "Reenvio",
          "Download do pacote ZIP",
          "Geração de SPED",
          "Geração de Sintegra",
          "XML",
          "Relatórios fiscais",
          "Inventário",
          "Histórico do cliente",
          "Movimentação dos itens",
        ],
      },
    ],
  },
  {
    number: "05",
    title: "Integrações, Acesso & Suporte",
    description: "Acesse a operação em diferentes dispositivos, conecte canais de venda e conte com uma estrutura de suporte para manter o uso fluindo.",
    icon: MonitorSmartphone,
    sections: [
      {
        title: "Integrações, PDV e canais digitais",
        items: ["Plataformas", "Smart POS", "Terminais de venda", "Catálogo digital", "Frente de caixa", "Smart TEF"],
        note: "Integrações com maquininhas, adquirentes, marketplaces, APIs e TEF podem depender de homologação, compatibilidade técnica, contratação ou custo adicional. A disponibilidade deve ser validada antes da contratação.",
      },
      {
        title: "Infraestrutura e acesso",
        items: [
          "Sistema 100% web",
          "Acesso por computador",
          "Acesso por tablet",
          "Acesso por celular",
          "Layout responsivo",
          "Usuários ilimitados",
          "Infraestrutura em nuvem",
          "Backup",
          "Suporte remoto",
          "Migração de dados",
          "Onboarding",
          "Treinamento",
        ],
      },
      {
        title: "Suporte",
        items: [
          "Atendimento por WhatsApp",
          "Atendimento por telefone",
          "Atendimento por e-mail",
          "Acesso remoto",
          "Atendimento humanizado",
          "Triagem e acompanhamento técnico pela MetOn",
        ],
      },
    ],
  },
];

const segments = [
  { icon: Building2, title: "Comércio", text: "Vendas, estoque, compras, clientes, NFC-e, NF-e, financeiro e vendedores." },
  { icon: Wrench, title: "Serviços", text: "OS, técnicos, contratos, NFS-e, faturamento, produtos e serviços aplicados." },
  { icon: UtensilsCrossed, title: "Food", text: "Mesas, garçom, caixa, bar, cozinha, cardápio e pedidos digitais." },
  { icon: Truck, title: "Distribuição", text: "Pedidos, compras, estoque, veículos, motoristas, MDF-e e faturamento." },
];

export function FeatureCatalog() {
  const reveal = useScrollReveal();

  return (
    <section id="funcionalidades" className={styles.section} ref={reveal}>
      <div className={styles.intro}>
        <div>
          <span className={styles.kicker}>Funcionalidades</span>
          <h2>Recursos disponíveis na MetOn Gestão.</h2>
        </div>
        <p>Abra cada categoria para visualizar as funcionalidades do sistema.</p>
      </div>

      <div className={styles.solutionList}>
        {solutions.map((solution) => {
          const Icon = solution.icon;
          return (
            <article key={solution.number} className={styles.solutionCard}>
              <div className={styles.solutionLead}>
                <div className={styles.solutionNumber}>{solution.number}</div>
                <div className={styles.solutionIcon}><Icon size={24} /></div>
                <h3>{solution.title}</h3>
                <p>{solution.description}</p>
              </div>

              <div className={styles.solutionContent}>
                <Accordion type="multiple">
                  {solution.sections.map((section, index) => (
                    <AccordionItem key={section.title} value={`${solution.number}-${index}`} className={styles.featureItem}>
                      <AccordionTrigger className={styles.featureTrigger}>{section.title}</AccordionTrigger>
                      <AccordionContent className={styles.featureContent}>
                        <div className={styles.featureGrid}>
                          {section.items.map((item) => (
                            <span key={item}><Check size={15} /> {item}</span>
                          ))}
                        </div>
                        {section.note && <div className={styles.note}>{section.note}</div>}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.segmentHeader} id="segmentos">
        <div>
          <span className={styles.kicker}>Segmentos</span>
          <h2>Aplicações por tipo de operação.</h2>
        </div>
        <p>Comércio, serviços, alimentação e distribuição.</p>
      </div>

      <div className={styles.segmentGrid}>
        {segments.map(({ icon: Icon, title, text }) => (
          <article key={title} className={styles.segmentCard}>
            <div className={styles.segmentIcon}><Icon size={20} /></div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <div className={styles.infrastructureStrip}>
        <span><Cloud size={17} /> 100% web</span>
        <span><MonitorSmartphone size={17} /> Computador, tablet e celular</span>
        <span><CreditCard size={17} /> Cobranças, Pix e boletos</span>
        <span><PackageCheck size={17} /> Estoque e inventário</span>
        <span><Landmark size={17} /> Bancos e conciliação</span>
        <span><BarChart3 size={17} /> DRE e relatórios</span>
        <span><FileText size={17} /> Documentos fiscais</span>
        <span><Settings2 size={17} /> Onboarding e suporte</span>
        <span><Boxes size={17} /> Usuários ilimitados</span>
      </div>
    </section>
  );
}
