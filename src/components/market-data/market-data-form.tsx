'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const marketDataSchema = z.object({
  cropType: z.string().min(1, 'Crop type is required'),
  strain: z.string().optional(),
  productCategory: z.enum(['flower', 'trim', 'extract', 'pre-roll', 'edible', 'other']),
  quality: z.enum(['A', 'B', 'C', 'D']),
  pricePerUnit: z.string().transform(val => parseFloat(val)),
  unitType: z.enum(['lb', 'kg', 'gram', 'oz']),
  quantity: z.string().transform(val => parseFloat(val)),
  buyerType: z.enum(['dispensary', 'processor', 'wholesale', 'direct']).optional(),
  buyerLocation: z.string().optional(),
  contractType: z.enum(['spot', 'contract', 'futures']).optional(),
  harvestDate: z.date().optional(),
  saleDate: z.date(),
});

type MarketDataFormValues = z.infer<typeof marketDataSchema>;

interface MarketDataFormProps {
  facilityId: string;
  onSuccess?: () => void;
}

export function MarketDataForm({ facilityId, onSuccess }: MarketDataFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [harvestDate, setHarvestDate] = useState<Date>();
  const [saleDate, setSaleDate] = useState<Date>(new Date());

  const form = useForm<MarketDataFormValues>({
    resolver: zodResolver(marketDataSchema),
    defaultValues: {
      cropType: 'Cannabis',
      productCategory: 'flower',
      quality: 'A',
      unitType: 'lb',
      saleDate: new Date(),
    },
  });

  const onSubmit = async (data: MarketDataFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/market-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          facilityId,
          harvestDate: harvestDate?.toISOString(),
          saleDate: saleDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit market data');
      }

      const result = await response.json();
      
      toast.success('Market data submitted successfully', {
        description: result.unlockedReports?.length > 0 
          ? `Unlocked ${result.unlockedReports.length} new reports!`
          : undefined,
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit market data');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Market Data</CardTitle>
        <CardDescription>
          Share your sales data to unlock industry benchmarks and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cropType">Crop Type</Label>
              <Input
                id="cropType"
                {...form.register('cropType')}
                placeholder="e.g., Cannabis, Lettuce"
              />
              {form.formState.errors.cropType && (
                <p className="text-sm text-red-500">{form.formState.errors.cropType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="strain">Strain/Variety</Label>
              <Input
                id="strain"
                {...form.register('strain')}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productCategory">Product Category</Label>
              <Select 
                value={form.watch('productCategory')}
                onValueChange={(value) => form.setValue('productCategory', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flower">Flower</SelectItem>
                  <SelectItem value="trim">Trim</SelectItem>
                  <SelectItem value="extract">Extract</SelectItem>
                  <SelectItem value="pre-roll">Pre-Roll</SelectItem>
                  <SelectItem value="edible">Edible</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Quality Grade</Label>
              <Select 
                value={form.watch('quality')}
                onValueChange={(value) => form.setValue('quality', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A (Premium)</SelectItem>
                  <SelectItem value="B">B (Standard)</SelectItem>
                  <SelectItem value="C">C (Budget)</SelectItem>
                  <SelectItem value="D">D (Processing)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerUnit">Price per Unit</Label>
              <Input
                id="pricePerUnit"
                type="number"
                step="0.01"
                {...form.register('pricePerUnit')}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitType">Unit Type</Label>
              <Select 
                value={form.watch('unitType')}
                onValueChange={(value) => form.setValue('unitType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lb">Pound (lb)</SelectItem>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="oz">Ounce (oz)</SelectItem>
                  <SelectItem value="gram">Gram (g)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Sold</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                {...form.register('quantity')}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerType">Buyer Type</Label>
              <Select 
                value={form.watch('buyerType')}
                onValueChange={(value) => form.setValue('buyerType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select buyer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dispensary">Dispensary</SelectItem>
                  <SelectItem value="processor">Processor</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="direct">Direct to Consumer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerLocation">Buyer Location</Label>
              <Input
                id="buyerLocation"
                {...form.register('buyerLocation')}
                placeholder="City, State"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Harvest Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {harvestDate ? format(harvestDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={harvestDate}
                    onSelect={setHarvestDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Sale Date*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {saleDate ? format(saleDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={saleDate}
                    onSelect={(date) => date && setSaleDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Market Data'}
              <TrendingUp className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}