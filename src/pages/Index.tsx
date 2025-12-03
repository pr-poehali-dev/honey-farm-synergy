import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import LiveStreamModal from '@/components/LiveStreamModal';

const regions = [
  { id: 'crimea', name: 'Крым', emoji: '🏖️', description: 'Целебный горный мед' },
  { id: 'altai', name: 'Алтай', emoji: '⛰️', description: 'Таежный медонос' },
  { id: 'bashkiria', name: 'Башкирия', emoji: '🌲', description: 'Башкирский липовый мед' },
  { id: 'krasnodar', name: 'Краснодарский край', emoji: '🌻', description: 'Акациевый и подсолнечный' },
];

const hiveTypes = [
  { 
    id: 'classic', 
    name: 'Классический', 
    price: 24000, 
    avgYield: 30,
    description: 'Стандартный улей на 12 рамок',
    icon: '🏠'
  },
  { 
    id: 'koloda', 
    name: 'Колода', 
    price: 24000, 
    avgYield: 30,
    description: 'Традиционный улей-колода',
    icon: '🪵'
  },
];

const leaderboard = [
  { rank: 1, nickname: 'ДикийВася89', type: 'Пасечник', coins: 145000, badge: '🏆' },
  { rank: 2, nickname: 'МедоваяКоролева', type: 'Пасечник', coins: 132000, badge: '🥈' },
  { rank: 3, nickname: 'АлтайскийМедведь', type: 'Пасечник', coins: 98000, badge: '🥉' },
  { rank: 4, nickname: 'БашкирскийПчеловод', type: 'Пасечник', coins: 87000, badge: '🐝' },
  { rank: 5, nickname: 'КрымскийФермер', type: 'Пасечник', coins: 76000, badge: '🐝' },
];

export default function Index() {
  const [userBalance, setUserBalance] = useState(50000);
  const [warehouse, setWarehouse] = useState([
    { id: 1, name: 'Мед в сотах', amount: 53, unit: 'кг', icon: '🍯' },
  ]);
  const [myCows, setMyCows] = useState<Array<{
    id: number;
    name: string;
    age: number;
    lactationDay: number;
    totalMilk: number;
    status: 'active' | 'rest';
  }>>([]);
  const [milkStorage, setMilkStorage] = useState(0);
  const [dairyProducts, setDairyProducts] = useState({
    milk: 0,
    butter: 0,
    sourCream: 0,
    kefir: 0,
    cheese: 0,
  });
  const [myHives, setMyHives] = useState([
    { id: 1, region: 'Алтай ⛰️', type: 'Стандарт', progress: 75, status: 'active', daysLeft: 120 },
  ]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedHiveType, setSelectedHiveType] = useState('');
  const [nickname, setNickname] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const handleRegister = () => {
    if (nickname.trim()) {
      setIsRegistered(true);
      toast.success(`Добро пожаловать, ${nickname}! 🐝`);
    }
  };

  const handleRentHive = async () => {
    if (!selectedRegion || !selectedHiveType) {
      toast.error('Выберите регион и тип улья');
      return;
    }
    
    const hive = hiveTypes.find(h => h.id === selectedHiveType);
    const region = regions.find(r => r.id === selectedRegion);
    if (!hive || !region) return;

    if (userBalance >= hive.price) {
      setUserBalance(userBalance - hive.price);
      
      const newHive = {
        id: myHives.length + 1,
        region: region.name,
        type: hive.name,
        progress: 0,
        status: 'active' as const,
        daysLeft: 365,
      };
      setMyHives([...myHives, newHive]);
      
      toast.success(`Улей арендован! Сезон начался 🎉`);
      return;
    }

    setIsPaymentProcessing(true);
    try {
      const response = await fetch('https://functions.poehali.dev/b0e9056d-9118-4528-a8a5-b019c8d4e376', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': nickname,
        },
        body: JSON.stringify({
          amount: hive.price,
          description: `Аренда улья ${hive.name} в регионе ${region.name}`,
        }),
      });

      const data = await response.json();
      
      if (data.payment_url) {
        window.open(data.payment_url, '_blank');
        toast.success('Перенаправляем на страницу оплаты...');
      } else {
        toast.error('Ошибка создания платежа');
      }
    } catch (error) {
      toast.error('Ошибка подключения к платежной системе');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleProcessHoney = () => {
    const honeyInComb = warehouse.find(item => item.name === 'Мед в сотах');
    if (honeyInComb && honeyInComb.amount >= 53) {
      setWarehouse([
        { id: 2, name: 'Мед жидкий', amount: 45, unit: 'кг', icon: '🍯' },
      ]);
      toast.success('Мед отжат! Получено 45 кг жидкого меда');
    }
  };

  const handleBuyCow = async () => {
    const cowPrice = 350000;
    
    if (userBalance >= cowPrice) {
      setUserBalance(userBalance - cowPrice);
      const newCow = {
        id: myCows.length + 1,
        name: `Корова №${myCows.length + 1}`,
        age: 2,
        lactationDay: 1,
        totalMilk: 0,
        status: 'active' as const,
      };
      setMyCows([...myCows, newCow]);
      toast.success('Корова куплена! Начинается лактация 🐄');
      return;
    }

    setIsPaymentProcessing(true);
    try {
      const response = await fetch('https://functions.poehali.dev/b0e9056d-9118-4528-a8a5-b019c8d4e376', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': nickname,
        },
        body: JSON.stringify({
          amount: cowPrice,
          description: 'Покупка коровы на ферму',
        }),
      });

      const data = await response.json();
      
      if (data.payment_url) {
        window.open(data.payment_url, '_blank');
        toast.success('Перенаправляем на страницу оплаты...');
      } else {
        toast.error('Ошибка создания платежа');
      }
    } catch (error) {
      toast.error('Ошибка подключения к платежной системе');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleCollectMilk = (cowId: number) => {
    const cow = myCows.find(c => c.id === cowId);
    if (!cow || cow.lactationDay > 305) {
      toast.error('Корова не в периоде лактации');
      return;
    }

    const currentDate = new Date();
    const month = currentDate.getMonth();
    const isSummer = month >= 5 && month <= 8;
    const dailyMilk = isSummer ? 15 : 10;

    setMilkStorage(prev => prev + dailyMilk);
    setMyCows(myCows.map(c => 
      c.id === cowId 
        ? { ...c, lactationDay: c.lactationDay + 1, totalMilk: c.totalMilk + dailyMilk }
        : c
    ));
    
    toast.success(`Собрано ${dailyMilk} литров молока! 🥛`);
  };

  const handleProcessMilk = (productType: string, amount: number) => {
    let milkNeeded = 0;
    let productAmount = 0;

    switch (productType) {
      case 'butter':
        milkNeeded = amount / 0.06;
        productAmount = amount;
        break;
      case 'sourCream':
        milkNeeded = amount / 0.1;
        productAmount = amount;
        break;
      case 'kefir':
        milkNeeded = amount / 0.95;
        productAmount = amount;
        break;
      case 'milk':
        milkNeeded = amount;
        productAmount = amount;
        break;
      case 'cheese':
        milkNeeded = amount / 0.1;
        productAmount = amount;
        break;
    }

    if (milkStorage < milkNeeded) {
      toast.error('Недостаточно молока на складе');
      return;
    }

    setMilkStorage(prev => prev - milkNeeded);
    setDairyProducts(prev => ({
      ...prev,
      [productType]: prev[productType as keyof typeof prev] + productAmount,
    }));

    const productNames: Record<string, string> = {
      butter: 'масло',
      sourCream: 'сметана',
      kefir: 'кефир',
      milk: 'молоко',
      cheese: 'сыр',
    };

    toast.success(`Произведено: ${productAmount} ${productType === 'kefir' || productType === 'milk' ? 'л' : 'г'} ${productNames[productType]}!`);
  };

  const handleSellHoney = () => {
    const liquidHoney = warehouse.find(item => item.name === 'Мед жидкий');
    if (liquidHoney && liquidHoney.amount >= 20) {
      const coins = 4000;
      setUserBalance(userBalance + coins);
      setWarehouse([
        { id: 2, name: 'Мед жидкий', amount: 25, unit: 'кг', icon: '🍯' },
      ]);
      toast.success(`+${coins} ПчелоКоинов! 💰`);
    }
  };

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-amber-200 shadow-xl">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🐝</div>
            <CardTitle className="text-3xl font-bold text-amber-900">АгроИмперия</CardTitle>
            <CardDescription className="text-base">Создайте свою ферму в облаке</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Ваш никнейм</Label>
              <Input
                id="nickname"
                placeholder="Например: ДикийВася89"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="border-amber-200"
              />
            </div>
            <Button 
              onClick={handleRegister} 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              size="lg"
            >
              Начать путешествие 🚀
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <div className="text-sm text-muted-foreground text-center">
              Станьте лидером топа и получайте эксклюзивные награды! 🏆
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-green-50">
      <header className="bg-white/80 backdrop-blur-sm border-b-2 border-amber-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🐝</div>
              <div>
                <h1 className="text-2xl font-bold text-amber-900">АгроИмперия</h1>
                <p className="text-sm text-muted-foreground">Фермер {nickname}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2 border-2 border-amber-400">
                <Icon name="Coins" className="mr-2" size={20} />
                {userBalance.toLocaleString()} ПчелоКоинов
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur">
            <TabsTrigger value="dashboard">
              <Icon name="LayoutDashboard" className="mr-2" size={18} />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="rent">
              <Icon name="Home" className="mr-2" size={18} />
              Моя Пасека
            </TabsTrigger>
            <TabsTrigger value="farm">
              <Icon name="Milk" className="mr-2" size={18} />
              Моя Ферма
            </TabsTrigger>
            <TabsTrigger value="warehouse">
              <Icon name="Package" className="mr-2" size={18} />
              Склад
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <Icon name="Activity" className="mr-2" size={18} />
              Метрика
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Icon name="Trophy" className="mr-2" size={18} />
              Топ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Card className="border-2 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Home" size={24} />
                  Моя Пасека
                </CardTitle>
                <CardDescription>Ваши арендованные ульи и текущий статус</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myHives.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Home" size={48} className="mx-auto mb-4 opacity-30" />
                    <p>У вас пока нет арендованных ульев</p>
                    <Button className="mt-4 bg-amber-500 hover:bg-amber-600" onClick={() => {
                      const tabs = document.querySelector('[value="rent"]');
                      if (tabs instanceof HTMLElement) tabs.click();
                    }}>
                      Арендовать первый улей
                    </Button>
                  </div>
                ) : (
                  myHives.map(hive => (
                    <Card key={hive.id} className="border border-amber-100 bg-gradient-to-br from-amber-50 to-white">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-3xl">🐝</span>
                              <h3 className="font-semibold text-lg">Улей {hive.type}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Icon name="MapPin" size={14} />
                              {hive.region}
                            </p>
                          </div>
                          <Badge variant={hive.status === 'active' ? 'default' : 'secondary'} className="bg-green-500">
                            Активен
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Прогресс сбора меда</span>
                              <span className="font-semibold">{hive.progress}%</span>
                            </div>
                            <Progress value={hive.progress} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="Calendar" size={16} className="text-amber-500" />
                              <span className="text-muted-foreground">Осталось дней:</span>
                              <span className="font-semibold">{hive.daysLeft}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="TrendingUp" size={16} className="text-green-500" />
                              <span className="text-muted-foreground">Ожидается:</span>
                              <span className="font-semibold">~30 кг</span>
                            </div>
                          </div>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => setShowLiveStream(true)}
                          >
                            <Icon name="Video" size={16} className="mr-2" />
                            Смотреть трансляцию
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 border-amber-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-2">🏡</div>
                  <CardTitle>Моя Пасека</CardTitle>
                  <CardDescription>Производство меда и продуктов пчеловодства</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Активных ульев:</span>
                      <span className="font-semibold">{myHives.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Регионов:</span>
                      <span className="font-semibold">{new Set(myHives.map(h => h.region)).size}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 opacity-50">
                <CardHeader>
                  <div className="text-4xl mb-2">🍷</div>
                  <CardTitle className="text-muted-foreground">Моя Винодельня</CardTitle>
                  <CardDescription>Скоро откроется</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">В разработке</Badge>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 opacity-50">
                <CardHeader>
                  <div className="text-4xl mb-2">🧀</div>
                  <CardTitle className="text-muted-foreground">Моя Сыроварня</CardTitle>
                  <CardDescription>Скоро откроется</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">В разработке</Badge>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Bell" size={24} />
                  Последние уведомления
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <div className="text-2xl">🐝</div>
                  <div className="flex-1">
                    <p className="font-semibold">Ваши пчелы начали собирать мед</p>
                    <p className="text-sm text-muted-foreground">Сезон начался! Прогресс: 75%</p>
                  </div>
                  <Badge variant="outline">Сегодня</Badge>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl">📦</div>
                  <div className="flex-1">
                    <p className="font-semibold">Товар поступил на склад</p>
                    <p className="text-sm text-muted-foreground">+53 кг меда в сотах</p>
                  </div>
                  <Badge variant="outline">2 дня назад</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rent" className="space-y-6">
            <Card className="border-2 border-amber-200">
              <CardHeader>
                <CardTitle>Арендовать новый улей</CardTitle>
                <CardDescription>
                  Стоимость аренды: 24,000 ПчелоКоинов / год • Средний урожай: 30 кг
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Выберите регион</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {regions.map((region) => (
                      <Card
                        key={region.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedRegion === region.id ? 'border-2 border-amber-500 bg-amber-50' : 'border'
                        }`}
                        onClick={() => setSelectedRegion(region.id)}
                      >
                        <CardContent className="p-4">
                          <div className="text-3xl mb-2">{region.emoji}</div>
                          <h3 className="font-semibold">{region.name}</h3>
                          <p className="text-sm text-muted-foreground">{region.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Выберите тип улья</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {hiveTypes.map((hive) => (
                      <Card
                        key={hive.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedHiveType === hive.id ? 'border-2 border-amber-500 bg-amber-50' : 'border'
                        }`}
                        onClick={() => setSelectedHiveType(hive.id)}
                      >
                        <CardContent className="p-4">
                          <div className="text-3xl mb-2">{hive.icon}</div>
                          <h3 className="font-semibold">{hive.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{hive.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{hive.price.toLocaleString()} ₽</Badge>
                            <span className="text-xs text-muted-foreground">~{hive.avgYield} кг/год</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleRentHive} 
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  size="lg"
                  disabled={!selectedRegion || !selectedHiveType}
                >
                  <Icon name="ShoppingCart" className="mr-2" />
                  Арендовать улей за 24,000 ПчелоКоинов
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="farm" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Milk" size={24} />
                    Купить корову
                  </CardTitle>
                  <CardDescription>
                    Стоимость: 350,000 ПчелоКоинов • Период лактации: 305 дней
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-8xl">🐄</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Возраст:</span>
                        <span className="font-semibold">2 года</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Молоко летом:</span>
                        <span className="font-semibold">~15 л/день</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Молоко зимой:</span>
                        <span className="font-semibold">~10 л/день</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Период лактации:</span>
                        <span className="font-semibold">305 дней</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleBuyCow}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    size="lg"
                    disabled={isPaymentProcessing}
                  >
                    <Icon name="ShoppingCart" className="mr-2" />
                    Купить корову за 350,000 ПчелоКоинов
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Droplet" size={24} />
                    Склад молока
                  </CardTitle>
                  <CardDescription>Собранное молоко и его переработка</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-center mb-4">
                      <span className="text-5xl">🥛</span>
                      <div className="text-3xl font-bold text-green-600 mt-2">
                        {milkStorage.toFixed(1)} л
                      </div>
                      <p className="text-sm text-muted-foreground">На складе</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Переработать молоко в:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const amount = Math.floor(milkStorage * 0.06);
                          if (amount > 0) handleProcessMilk('butter', amount);
                        }}
                        disabled={milkStorage < 1}
                      >
                        🧈 Масло
                        <span className="text-xs ml-1">(60г/л)</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const amount = Math.floor(milkStorage * 0.1);
                          if (amount > 0) handleProcessMilk('sourCream', amount);
                        }}
                        disabled={milkStorage < 1}
                      >
                        🥄 Сметана
                        <span className="text-xs ml-1">(100г/л)</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const amount = Math.floor(milkStorage * 0.95 * 10) / 10;
                          if (amount > 0) handleProcessMilk('kefir', amount);
                        }}
                        disabled={milkStorage < 1}
                      >
                        🥛 Кефир
                        <span className="text-xs ml-1">(950мл/л)</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const amount = Math.floor(milkStorage);
                          if (amount > 0) handleProcessMilk('milk', amount);
                        }}
                        disabled={milkStorage < 1}
                      >
                        🍼 Молоко
                        <span className="text-xs ml-1">(1л/л)</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="col-span-2"
                        onClick={() => {
                          const amount = Math.floor(milkStorage * 0.1);
                          if (amount > 0) handleProcessMilk('cheese', amount);
                        }}
                        disabled={milkStorage < 1}
                      >
                        🧀 Сыр
                        <span className="text-xs ml-1">(100г/л)</span>
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <Label>Готовая продукция:</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between bg-amber-50 p-2 rounded">
                        <span>🧈 Масло:</span>
                        <span className="font-semibold">{dairyProducts.butter}г</span>
                      </div>
                      <div className="flex justify-between bg-amber-50 p-2 rounded">
                        <span>🥄 Сметана:</span>
                        <span className="font-semibold">{dairyProducts.sourCream}г</span>
                      </div>
                      <div className="flex justify-between bg-amber-50 p-2 rounded">
                        <span>🥛 Кефир:</span>
                        <span className="font-semibold">{dairyProducts.kefir.toFixed(1)}л</span>
                      </div>
                      <div className="flex justify-between bg-amber-50 p-2 rounded">
                        <span>🍼 Молоко:</span>
                        <span className="font-semibold">{dairyProducts.milk}л</span>
                      </div>
                      <div className="flex justify-between bg-amber-50 p-2 rounded col-span-2">
                        <span>🧀 Сыр:</span>
                        <span className="font-semibold">{dairyProducts.cheese}г</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={Object.values(dairyProducts).every(v => v === 0)}
                  >
                    <Icon name="Truck" className="mr-2" />
                    Оформить доставку
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Milk" size={24} />
                  Мои коровы
                </CardTitle>
                <CardDescription>Управление вашим стадом</CardDescription>
              </CardHeader>
              <CardContent>
                {myCows.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Milk" size={48} className="mx-auto mb-4 opacity-30" />
                    <p>У вас пока нет коров</p>
                    <p className="text-sm mt-2">Купите первую корову чтобы начать производство молока</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {myCows.map(cow => (
                      <Card key={cow.id} className="border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-3xl">🐄</span>
                                <h3 className="font-semibold text-lg">{cow.name}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Возраст: {cow.age} года
                              </p>
                            </div>
                            <Badge variant={cow.status === 'active' ? 'default' : 'secondary'} className="bg-green-500">
                              {cow.lactationDay <= 305 ? 'Активна' : 'Отдых'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-sm">
                                <span className="text-muted-foreground">День лактации:</span>
                                <p className="font-semibold">{cow.lactationDay}/305</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Всего молока:</span>
                                <p className="font-semibold">{cow.totalMilk} л</p>
                              </div>
                            </div>
                            
                            <Progress value={(cow.lactationDay / 305) * 100} className="h-2" />
                            
                            <Button 
                              className="w-full bg-blue-500 hover:bg-blue-600"
                              size="sm"
                              onClick={() => handleCollectMilk(cow.id)}
                              disabled={cow.lactationDay > 305}
                            >
                              <Icon name="Droplet" className="mr-2" size={16} />
                              Собрать молоко
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warehouse" className="space-y-6">
            <Card className="border-2 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Package" size={24} />
                  Личный склад
                </CardTitle>
                <CardDescription>Управление вашими продуктами</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {warehouse.map((item) => (
                  <Card key={item.id} className="bg-amber-50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{item.icon}</div>
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-2xl font-bold text-amber-600">
                            {item.amount} {item.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {item.name === 'Мед в сотах' && (
                          <Button onClick={handleProcessHoney} variant="outline">
                            <Icon name="Droplet" className="mr-2" size={18} />
                            Отжать мед
                          </Button>
                        )}
                        {item.name === 'Мед жидкий' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="default" className="bg-green-600 hover:bg-green-700">
                                <Icon name="DollarSign" className="mr-2" size={18} />
                                Продать
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Продать мед на маркете</DialogTitle>
                                <DialogDescription>
                                  Обменяйте ваш мед на ПчелоКоины
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-4 bg-amber-50 rounded-lg">
                                  <p className="text-sm text-muted-foreground">Цена ОПТ -20%</p>
                                  <p className="text-lg font-semibold">200 ₽/кг = 200 ПчелоКоинов/кг</p>
                                </div>
                                <div className="space-y-2">
                                  <Label>Количество (кг)</Label>
                                  <Input type="number" placeholder="20" defaultValue="20" />
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                  <p className="text-sm text-muted-foreground">Вы получите:</p>
                                  <p className="text-2xl font-bold text-green-600">+4,000 ПчелоКоинов</p>
                                </div>
                                <Button onClick={handleSellHoney} className="w-full bg-green-600 hover:bg-green-700">
                                  Продать мед
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Truck" size={24} />
                  Упаковка и доставка
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите упаковку" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kubo">Кубтейнер 20 кг</SelectItem>
                    <SelectItem value="barrel">Боченок дубовый 1 кг</SelectItem>
                    <SelectItem value="jar">Стеклянная банка 0.5 кг</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Input placeholder="Город доставки" />
                  <Button variant="outline">
                    <Icon name="MapPin" size={18} />
                  </Button>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">Доставка до ТК: <span className="font-semibold">500 ₽</span></p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Thermometer" size={24} />
                    Температура улья
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-amber-600 mb-2">+34°C</div>
                  <p className="text-sm text-muted-foreground">Оптимальная температура</p>
                  <Progress value={85} className="mt-4" />
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Droplets" size={24} />
                    Влажность
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-blue-600 mb-2">65%</div>
                  <p className="text-sm text-muted-foreground">В норме</p>
                  <Progress value={65} className="mt-4" />
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={24} />
                    Прогресс сезона
                  </CardTitle>
                  <CardDescription>До конца сбора меда осталось 78 дней</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={75} className="h-6 mb-4" />
                  <div className="flex justify-between text-sm">
                    <span>Начало сезона</span>
                    <span className="font-semibold text-green-600">75% завершено</span>
                    <span>Конец сезона</span>
                  </div>
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-lg font-semibold">Прогноз урожая: ~30 кг</p>
                    <p className="text-sm text-muted-foreground">При текущих условиях</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BarChart3" size={24} />
                  Статистика производства
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                    <span className="text-muted-foreground">Всего собрано меда:</span>
                    <span className="text-2xl font-bold text-amber-600">53 кг</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-muted-foreground">Продано меда:</span>
                    <span className="text-2xl font-bold text-green-600">28 кг</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-muted-foreground">Заработано ПчелоКоинов:</span>
                    <span className="text-2xl font-bold text-blue-600">5,600</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="border-2 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Trophy" size={24} />
                  Топ пасечников
                </CardTitle>
                <CardDescription>Лидеры получают эксклюзивные награды и призы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((leader) => (
                    <div
                      key={leader.rank}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-md ${
                        leader.rank <= 3
                          ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="text-3xl">{leader.badge}</div>
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-amber-200 text-amber-900 font-bold">
                          {leader.rank}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-lg">{leader.nickname}</p>
                        <p className="text-sm text-muted-foreground">{leader.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-amber-600">
                          {leader.coins.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">ПчелоКоинов</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <div className="w-full p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg">
                  <h3 className="font-semibold mb-2">🎁 Награды лидерам:</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Маточное молоко (премиум-продукт)</li>
                    <li>• Свечи из пчелиного воска ручной работы</li>
                    <li>• Набор для настойки из пчелиного мора</li>
                    <li>• Скидки до 50% на новые ульи</li>
                    <li>• Бесплатная экскурсия на ферму</li>
                  </ul>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <LiveStreamModal 
        isOpen={showLiveStream} 
        onClose={() => setShowLiveStream(false)} 
      />
    </div>
  );
}