import { Recycle, Truck, BarChart3, Users, Shield, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

export const ServicesPage = ({ onNavigate }: ServicesPageProps) => {
  const services = [
    {
      icon: Recycle,
      title: "Marketplace de Resíduos",
      description: "Plataforma digital para compra e venda de materiais recicláveis entre empresas",
      features: [
        "Catálogo completo de materiais",
        "Sistema de cotações em tempo real",
        "Verificação de qualidade dos materiais",
        "Histórico de transações detalhado"
      ],
      benefits: [
        "Redução de custos operacionais",
        "Novos fluxos de receita",
        "Processo de venda simplificado"
      ]
    },
    {
      icon: Truck,
      title: "Logística Integrada",
      description: "Gestão completa da coleta, transporte e entrega de resíduos",
      features: [
        "Rede de transportadores parceiros",
        "Rastreamento em tempo real",
        "Otimização de rotas",
        "Documentação automática"
      ],
      benefits: [
        "Economia em transporte",
        "Maior confiabilidade",
        "Redução de tempo"
      ]
    },
    {
      icon: BarChart3,
      title: "Análise e Relatórios",
      description: "Dashboards e relatórios para monitoramento de sustentabilidade",
      features: [
        "Métricas de impacto ambiental",
        "Relatórios de compliance",
        "Análise de tendências",
        "Certificações automáticas"
      ],
      benefits: [
        "Tomada de decisão baseada em dados",
        "Compliance facilitado",
        "Evidências de sustentabilidade"
      ]
    },
    {
      icon: Users,
      title: "Consultoria Especializada",
      description: "Suporte técnico e consultoria em gestão de resíduos",
      features: [
        "Auditoria de processos",
        "Planos de sustentabilidade",
        "Treinamento de equipes",
        "Implementação de melhores práticas"
      ],
      benefits: [
        "Otimização de processos",
        "Capacitação técnica",
        "Resultados mensuráveis"
      ]
    },
    {
      icon: Shield,
      title: "Compliance e Certificação",
      description: "Garantia de conformidade com normas ambientais e regulamentações",
      features: [
        "Acompanhamento regulatório",
        "Documentação legal",
        "Certificações ambientais",
        "Auditoria de compliance"
      ],
      benefits: [
        "Conformidade garantida",
        "Redução de riscos",
        "Credibilidade no mercado"
      ]
    },
    {
      icon: Award,
      title: "Programa de Parceiros",
      description: "Rede exclusiva de empresas comprometidas com a sustentabilidade",
      features: [
        "Parcerias estratégicas",
        "Networking empresarial",
        "Projetos colaborativos",
        "Eventos e capacitações"
      ],
      benefits: [
        "Expansão de rede",
        "Oportunidades de negócio",
        "Fortalecimento da marca"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-eco text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Nossos Serviços
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Soluções completas para gestão sustentável de resíduos empresariais
          </p>
          <Badge variant="secondary" className="bg-white text-eco-green px-4 py-2 text-lg">
            Especialistas em Soluções B2B
          </Badge>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="border-eco-green/20 hover:shadow-eco transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-eco-green/10 rounded-lg group-hover:bg-eco-green/20 transition-colors">
                      <service.icon className="h-8 w-8 text-eco-green" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-eco-green">
                        {service.title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-3 text-eco-green">Como Funciona:</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-eco-green mr-2 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="font-semibold mb-3 text-eco-green">Benefícios:</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.benefits.map((benefit, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-eco-green mb-6">
              Como Trabalhamos
            </h2>
            <p className="text-lg text-muted-foreground">
              Processo simplificado para transformar seus resíduos em oportunidades
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Análise", desc: "Avaliamos suas necessidades e tipos de resíduos" },
              { step: "2", title: "Conexão", desc: "Conectamos com parceiros ideais em nossa rede" },
              { step: "3", title: "Transação", desc: "Facilitamos a negociação e documentação" },
              { step: "4", title: "Monitoramento", desc: "Acompanhamos resultados e impactos" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-eco rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-eco-green mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {index < 3 && (
                  <ArrowRight className="hidden md:block h-6 w-6 text-eco-green mx-auto mt-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-eco-green">
            Pronto para Otimizar sua Gestão de Resíduos?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Entre em contato conosco e descubra como podemos ajudar sua empresa 
            a alcançar seus objetivos de sustentabilidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => onNavigate('auth')}
              size="lg"
              className="bg-gradient-eco hover:opacity-90"
            >
              Começar Agora
            </Button>
            <Button 
              onClick={() => onNavigate('about')}
              variant="outline" 
              size="lg"
            >
              Saber Mais
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};