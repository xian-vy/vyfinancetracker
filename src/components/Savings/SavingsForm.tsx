import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Timestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { CirclePicker } from "react-color";
import { getRandomColor } from "../../firebase/defaultData";
import { currentDatetoDatePicker } from "../../helper/date";
import { isValidInput } from "../../helper/utils";
import SavingsIcons from "../../media/SavingsIcons";
import SavingGoalsModel from "../../models/SavingGoalsModel";
import EntryFormButton from "../GenericComponents/EntryFormButton";
import EntryFormDatePicker from "../GenericComponents/EntryFormDatePicker";
import IconListComponent from "../Maintenance/IconListComponent";

interface Props {
  onAddSavings: (savings: SavingGoalsModel) => void;
  EditSavings: SavingGoalsModel;
  onCloseForm: () => void;
  isEditMode: boolean;
}

const SavingsForm = (props: Props) => {
  const [startDate, setStartDate] = useState<Date>(currentDatetoDatePicker);
  const [endDate, setEndDate] = useState<Date>(currentDatetoDatePicker);
  const [checked, setChecked] = useState(false);
  const [color, setColor] = useState("#000000");

  const [newSavings, setNewSavings] = useState<SavingGoalsModel>({
    id: "",
    description: "",
    notes: "",
    targetAmount: 0,
    currentAmount: 0,
    startDate: Timestamp.now(),
    endDate: Timestamp.now(),
    status: "In Progress",
    autoContributionAmount: 0,
    contributionFrequency: "Monthly",
    autoContributionStatus: 0,
    icon: "",
    color: "",
  });

  const amountRef = useRef<HTMLInputElement | null>(null);
  const savingdescriptionRef = useRef<HTMLInputElement | null>(null);

  const canSave = Boolean(Number(amountRef.current?.value) > 0) && Boolean(savingdescriptionRef.current?.value !== "");

  const handleColorChange = (newColor: { hex: string }) => {
    setColor(newColor.hex);
    setNewSavings((prevState) => ({ ...prevState, color: newColor.hex }));
  };

  const { IconSelectComponent, loadIcons } = IconListComponent({
    icons: SavingsIcons,
    selectedIcon: newSavings.icon,
    onIconSelect: handleIconSelect,
    color: color,
  });

  function handleIconSelect(iconName: string) {
    setNewSavings({ ...newSavings, icon: iconName });
  }
  const handleFormSubmit = async () => {
    try {
      let CurrentAmount = newSavings.currentAmount;

      const updatedSavings = {
        ...newSavings,
        status: CurrentAmount < newSavings.targetAmount ? "In Progress" : newSavings.status,
      };

      props.onAddSavings(updatedSavings);
    } catch (error) {
      console.error("Error savings:", error);
    }
  };

  useEffect(() => {
    const fetchSavings = async () => {
      if (props.isEditMode) {
        try {
          setNewSavings((prevState) => {
            const updatedState = {
              ...prevState,
              ...props.EditSavings,
            };
            setStartDate(props.EditSavings.startDate.toDate());
            setEndDate(props.EditSavings.endDate.toDate());
            setChecked(props.EditSavings.autoContributionStatus === 1 ? true : false);
            handleIconSelect(props.EditSavings.icon);
            setColor(props.EditSavings.color);
            return updatedState;
          });
        } catch (error) {
          console.error("Edit Mode Savings", error);
        }
      } else {
        const randomColor = getRandomColor();
        setColor(randomColor);
        setNewSavings((prevState) => ({ ...prevState, color: randomColor }));
      }
    };
    // savingdescriptionRef.current?.focus();

    fetchSavings();
    loadIcons();
  }, []);

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6"> Savings Entry Form</Typography>
        <IconButton onClick={() => props.onCloseForm()} sx={{ mr: -1.5 }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Stack
        spacing={1.5}
        padding={1.5}
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
      >
        <TextField
          required
          size="small"
          inputRef={savingdescriptionRef}
          label="Savings For"
          value={newSavings.description}
          onChange={(e) => {
            if (e.target.value.length <= 75) {
              setNewSavings({ ...newSavings, description: e.target.value });
            }
          }}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          inputRef={amountRef}
          required
          inputMode="numeric"
          inputProps={{ inputMode: "numeric" }}
          size="small"
          label="Goal Amount"
          value={new Intl.NumberFormat("en-US").format(newSavings.targetAmount)}
          onChange={(e) => {
            const value = e.target.value;
            if (isValidInput(value) && value.length <= 8) {
              setNewSavings({
                ...newSavings,
                targetAmount: parseFloat(value) || 0,
              });
            }
          }}
          InputLabelProps={{ shrink: true }}
        />

        <Stack direction="row" justifyContent="space-between" spacing={0.5}>
          <EntryFormDatePicker
            selectedDate={startDate}
            setSelectedDate={() => setStartDate}
            newData={newSavings}
            setNewData={setNewSavings}
            label="Start Date"
            datefield="startDate"
          />

          <EntryFormDatePicker
            selectedDate={endDate}
            setSelectedDate={() => setEndDate}
            newData={newSavings}
            setNewData={setNewSavings}
            label="Target Date"
            datefield="endDate"
          />
        </Stack>
        {/* <TextField
          label="Notes"
          size="small"
          value={newSavings.notes}
          onChange={(e) => {
            if (e.target.value.length <= 75) {
              setNewSavings({ ...newSavings, notes: e.target.value });
            }
          }}
          InputLabelProps={{ shrink: true }}
        /> */}

        {IconSelectComponent}
        <Box display="flex" justifyContent="center">
          <CirclePicker color={color} onChange={handleColorChange} />
        </Box>

        <FormControl fullWidth>
          <FormControlLabel
            control={
              <Checkbox
                checked={newSavings.autoContributionStatus === 1}
                onChange={(e) => {
                  setChecked(!checked);
                  setNewSavings({
                    ...newSavings,
                    autoContributionStatus: e.target.checked ? 1 : 0,
                  });
                }}
              />
            }
            label="Auto Contribution"
            sx={{ display: "none" }}
          ></FormControlLabel>
          <FormHelperText style={{ color: "darkgreen", marginLeft: 0 }}>
            {newSavings.autoContributionStatus ? "Allow system to auto add contribution every selected timeframe" : ""}
          </FormHelperText>
        </FormControl>
        <Collapse in={checked} sx={{ display: "none" }}>
          <TextField
            required
            label="Auto Amount"
            type=""
            fullWidth
            value={newSavings.autoContributionAmount}
            onChange={(e) => {
              if (!isNaN(Number(e.target.value))) {
                setNewSavings({
                  ...newSavings,
                  autoContributionAmount: parseFloat(e.target.value) || 0,
                });
              }
            }}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Timeframe</InputLabel>
            <Select
              required
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Timeframe"
              value={newSavings.contributionFrequency}
              onChange={(e) => {
                setNewSavings({
                  ...newSavings,
                  contributionFrequency: e.target.value as string,
                });
              }}
            >
              <MenuItem key="Daily" value="Daily">
                Daily
              </MenuItem>
              <MenuItem key="Weekly" value="Weekly">
                Weekly
              </MenuItem>
              <MenuItem key="Monthly" value="Monthly">
                Monthly
              </MenuItem>
            </Select>
          </FormControl>
        </Collapse>

        <EntryFormButton isLoading={false} canSave={canSave} isEditMode={props.isEditMode} />
      </Stack>
    </>
  );
};

export default SavingsForm;
