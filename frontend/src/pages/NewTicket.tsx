import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Save, AlertCircle, ChevronLeft } from 'lucide-react';
import {
  createTicket,
  updateTicket,
  getTicketById,
  getAllCategories,
  mapPriorityNumberToString,
  mapPriorityStringToNumber,
  CategoryResponse,
  TicketPriority,
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NewTicket() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  // State now tracks the category NAME for clarity
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: mapPriorityNumberToString(2),
    categoryName: '',
  });

  useEffect(() => {
    const loadPageData = async () => {
      const catRes = await getAllCategories();
      let fetchedCategories: CategoryResponse[] = [];

      if (catRes.success) {
        // Sort categories by ID so they appear in a consistent order
        fetchedCategories = [...catRes.data].sort((a, b) => a.id - b.id);
        setCategories(fetchedCategories);
      }

      if (isEditing) {
        const ticketRes = await getTicketById(Number(id));
        if (ticketRes.success) {
          const t = ticketRes.data;
          setFormData({
            title: t.title,
            description: t.description,
            priority: mapPriorityNumberToString(t.priority),
            categoryName: t.category.name, // Set name from existing ticket
          });
        }
      } else if (fetchedCategories.length > 0) {
        // Default to the first category name (e.g., the one with ID 1)
        setFormData((prev) => ({ ...prev, categoryName: fetchedCategories[0].name }));
      }
    };
    loadPageData();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Resolve Name -> ID right before submission
    const selectedCategory = categories.find((c) => c.name === formData.categoryName);

    if (!selectedCategory) {
      toast.error('Invalid category selection');
      return;
    }

    setIsSubmitting(true);

    // 2. Map the data back to numeric/ID formats for the API
    const payload = {
      title: formData.title,
      description: formData.description,
      priority: mapPriorityStringToNumber(formData.priority),
      categoryId: selectedCategory.id, // The numeric ID the backend wants
    };

    const res = isEditing ? await updateTicket(Number(id), payload) : await createTicket(payload);

    if (res.success) {
      toast.success(res.message);
      navigate('/tickets');
    } else {
      toast.error(res.message || 'Operation failed');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2 text-slate-500">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <h1 className="mb-3 text-4xl font-black tracking-tight">
          {isEditing ? 'Modify Incident' : 'Initialize Incident'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none bg-white shadow-2xl dark:bg-slate-900">
          <CardHeader className="p-10">
            <CardTitle className="text-2xl font-bold">Ticket Parameters</CardTitle>
            <CardDescription>All details below will be processed by Sentinel Core.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 px-10 pb-10">
            {/* Subject */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-500 uppercase">Subject Line</Label>
              <Input
                className="h-11 border-none bg-slate-50 placeholder:text-slate-500/40 dark:bg-slate-800"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Category Dropdown (Uses Names) */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-500 uppercase">Category</Label>
                <Select
                  value={formData.categoryName}
                  onValueChange={(v) => setFormData({ ...formData, categoryName: v })}
                >
                  <SelectTrigger className="h-11 border-none bg-slate-50 dark:bg-slate-800">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Dropdown */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-500 uppercase">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v as TicketPriority })}
                >
                  <SelectTrigger className="h-11 border-none bg-slate-50 dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-500 uppercase">Description</Label>
              <textarea
                className="min-h-[150px] w-full rounded-xl border-none bg-slate-50 p-4 text-sm placeholder:text-slate-500/40 dark:bg-slate-800"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between bg-slate-50 p-10 dark:bg-slate-800/50">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-8 font-bold shadow-lg">
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : isEditing ? (
                'Update'
              ) : (
                'Submit'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
