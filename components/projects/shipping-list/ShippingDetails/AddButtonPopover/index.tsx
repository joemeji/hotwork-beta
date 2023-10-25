import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { memo } from "react";

const AddButtonPopover = (props: AddButtonPopoverProps) => {
  const { onClickAddCategoryButton, onClickAddEquipmentButton, onClickAddSetButton, onClickAddCustomEquipment } = props;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="shadow-2xl p-3 rounded-full font-medium flex gap-2 items-center">
          <Plus className="w-[20px] h-[20px]" />
        </Button> 
      </PopoverTrigger>
      <PopoverContent className="border-stone-100 py-2 px-0 w-auto">
        <div className="flex flex-col">
          <AddPopOverMenu                 
            title="Add Equipment"
            onClick={onClickAddEquipmentButton}
          />
          <AddPopOverMenu                 
            title="Add Custom Equipment"
            onClick={onClickAddCustomEquipment}
          />
          <AddPopOverMenu                 
            title="Add Category"
            onClick={onClickAddCategoryButton}
          />
          <AddPopOverMenu                 
            title="Add From Sets"
            onClick={onClickAddSetButton}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default memo(AddButtonPopover);

type AddButtonPopoverProps = {
  onClickAddEquipmentButton?: () => void
  onClickAddCategoryButton?: () => void
  onClickAddSetButton?: () => void
  onClickAddCustomEquipment?: () => void
};

export function AddPopOverMenu({ title, iconImage, iconColor, iconBg, ...props }: any) {
  return (
    <button className="hover:bg-stone-100 w-full py-2 px-3 font-medium flex gap-2 items-center" {...props}>
      <span>{title}</span>
    </button>
  );
}