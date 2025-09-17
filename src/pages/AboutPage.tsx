import { ArrowRight, Leaf, Users, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage = ({ onNavigate }: AboutPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-eco text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Sobre a EcoChain
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Conectando empresas para um futuro mais sustentável através da gestão inteligente de resíduos
          </p>
          <Button 
            onClick={() => onNavigate('services')}
            variant="secondary" 
            size="lg"
            className="bg-white text-eco-green hover:bg-gray-100"
          >
            Conheça Nossos Serviços
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-eco-green/20 hover:shadow-eco transition-all duration-300">
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-eco-green mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold text-eco-green">Nossa Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Transformar a gestão de resíduos em oportunidades de negócio, 
                  conectando empresas B2B para criar uma economia circular 
                  eficiente e sustentável.
                </p>
              </CardContent>
            </Card>

            <Card className="border-eco-green/20 hover:shadow-eco transition-all duration-300">
              <CardHeader className="text-center">
                <Leaf className="h-12 w-12 text-eco-green mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold text-eco-green">Nossa Visão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Ser a principal plataforma B2B de gestão de resíduos do Brasil, 
                  liderando a transformação digital do setor de reciclagem e 
                  sustentabilidade empresarial.
                </p>
              </CardContent>
            </Card>

            <Card className="border-eco-green/20 hover:shadow-eco transition-all duration-300">
              <CardHeader className="text-center">
                <Award className="h-12 w-12 text-eco-green mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold text-eco-green">Nossos Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Sustentabilidade em primeiro lugar</li>
                  <li>• Transparência nas transações</li>
                  <li>• Inovação tecnológica</li>
                  <li>• Parceria estratégica</li>
                  <li>• Responsabilidade ambiental</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-eco-green mb-6">
              Quem Somos
            </h2>
            <p className="text-lg text-muted-foreground">
              A EcoChain é uma plataforma B2B especializada em conectar empresas 
              geradoras de resíduos com empresas recicladoras e gestoras de materiais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-eco-green">
                Foco em Soluções B2B
              </h3>
              <p className="text-muted-foreground mb-6">
                Nossa plataforma foi desenvolvida especificamente para atender as 
                necessidades do mercado empresarial, oferecendo ferramentas 
                profissionais para gestão, monitoramento e comercialização de resíduos.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <Users className="h-5 w-5 text-eco-green mr-3 mt-0.5" />
                  Conectamos empresas de diferentes setores
                </li>
                <li className="flex items-start">
                  <Leaf className="h-5 w-5 text-eco-green mr-3 mt-0.5" />
                  Promovemos a economia circular
                </li>
                <li className="flex items-start">
                  <Target className="h-5 w-5 text-eco-green mr-3 mt-0.5" />
                  Otimizamos processos de reciclagem
                </li>
              </ul>
            </div>

            <div className="bg-gradient-eco rounded-lg p-8 text-white">
              <h4 className="text-xl font-bold mb-4">Nossa Experiência</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">5+</div>
                  <div className="text-sm opacity-90">Anos no Mercado</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">200+</div>
                  <div className="text-sm opacity-90">Empresas Parceiras</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-sm opacity-90">Tipos de Materiais</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-sm opacity-90">Suporte Técnico</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-eco-green">
            Pronto para Fazer Parte da Mudança?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se às empresas que já estão transformando seus resíduos em 
            oportunidades de negócio com a EcoChain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => onNavigate('auth')}
              size="lg"
              className="bg-gradient-eco hover:opacity-90"
            >
              Cadastre sua Empresa
            </Button>
            <Button 
              onClick={() => onNavigate('home')}
              variant="outline" 
              size="lg"
            >
              Explorar Plataforma
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};