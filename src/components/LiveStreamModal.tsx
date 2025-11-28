import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';

interface Camera {
  id: string;
  hive_id: string;
  region: string;
  name: string;
  status: string;
  stream_url: string;
  thumbnail: string;
  viewers: number;
  temperature: number;
  humidity: number;
}

interface LiveStreamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LiveStreamModal({ open, onOpenChange }: LiveStreamModalProps) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  useEffect(() => {
    if (open) {
      fetch('https://functions.poehali.dev/c7bf8248-4769-441c-be16-62d42ca5fd4c')
        .then(res => res.json())
        .then(data => {
          setCameras(data.cameras || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Video" size={24} />
            Онлайн-трансляция с ульев
          </DialogTitle>
          <DialogDescription>
            Наблюдайте за вашими ульями в реальном времени • Подписка 99₽/месяц
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : selectedCamera ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <video
                    className="w-full h-full"
                    controls
                    autoPlay
                    poster={selectedCamera.thumbnail}
                  >
                    <source src={selectedCamera.stream_url} type="application/x-mpegURL" />
                    Ваш браузер не поддерживает видео
                  </video>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant="destructive" className="bg-red-600">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      LIVE
                    </Badge>
                    <Badge variant="secondary">
                      <Icon name="Users" size={14} className="mr-1" />
                      {selectedCamera.viewers}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div>
                <h3 className="font-semibold">{selectedCamera.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedCamera.region}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <Icon name="Thermometer" size={20} className="mx-auto text-amber-600" />
                  <p className="text-lg font-bold">{selectedCamera.temperature}°C</p>
                </div>
                <div className="text-center">
                  <Icon name="Droplets" size={20} className="mx-auto text-blue-600" />
                  <p className="text-lg font-bold">{selectedCamera.humidity}%</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCamera(null)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Назад к списку камер
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cameras.map((camera) => (
              <Card
                key={camera.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedCamera(camera)}
              >
                <CardContent className="p-4">
                  <div className="relative mb-3">
                    <img
                      src={camera.thumbnail}
                      alt={camera.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 bg-green-600 text-white"
                    >
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      {camera.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{camera.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{camera.region}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Icon name="Users" size={14} />
                      {camera.viewers} зрителей
                    </span>
                    <span>{camera.temperature}°C • {camera.humidity}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
