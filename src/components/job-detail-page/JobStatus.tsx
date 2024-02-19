"use client";
import React from "react";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useAlertDialogDataDispatch } from "./AlertDialogDataProvider";
import { JobResponseDto } from "@/api/api-spec";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { JobStatusEnum, jobStatuses } from "@/lib/constants";

interface Props {
  job: JobResponseDto;
  disabled?: boolean;
}

export default function JobStatus({ job, disabled = false }: Props) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const currentStatus = jobStatuses[job.jobStatus];
  const dispatch = useAlertDialogDataDispatch();

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="px-3 font-normal gap-2 justify-between w-full"
          disabled={disabled}
        >
          <div className="flex gap-2 items-center">
            <currentStatus.Icon className={`w-4 h-4 ${currentStatus.color}`} />
            <span>{currentStatus.value}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="start">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandEmpty>No status found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {JobStatusEnum.options.map((value) => {
                const status = jobStatuses[value];
                const isSelected = status.value === currentStatus.value;

                return (
                  <CommandItem
                    key={value}
                    value={value}
                    onSelect={() => {
                      if (isSelected) {
                        return;
                      }

                      dispatch({
                        type: "UPDATE_JOB_STATUS",
                        jobId: job.id,
                        projectId: job.projectId,
                        status: value,
                      });
                      setPopoverOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex gap-2 items-center">
                      <status.Icon className={`w-4 h-4 ${status.color}`} />
                      <span>{status.value}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}