import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import useErrorHandler from "@/hooks/useError";
import { getAilmentList } from "@/https/patients-service";
import { useEffect, useState } from "react";

const Ailment = ({
  hospitalId,
  onChange,
  selectedValue,
  disabled = false,
}: {
  hospitalId: string;
  onChange: any;
  selectedValue: string;
  disabled?: boolean;
}) => {
  const [ailmentList, setAilmentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleError = useErrorHandler();

  const fetchAilmentList = async () => {
    try {
      setLoading(true);
      const res = await getAilmentList(hospitalId);
      setAilmentList(res.data.data);
    } catch (error) {
      handleError(error, "Failed to fetch ailments list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAilmentList();
  }, []);

  if (loading) return <Skeleton className="h-10" />;
  return (
    <Select onValueChange={onChange} value={selectedValue} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Choose an ailment"></SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {ailmentList.map((ailment: { id: string; name: string }) => (
            <SelectItem
              value={ailment.id}
              className="capitalize"
              key={ailment.id}
            >
              {ailment.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default Ailment;
