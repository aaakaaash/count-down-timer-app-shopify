//count-down-timer-app/app/routes/app._index.jsx

import { useState } from "react";
import { useLoaderData, Form, useActionData, useNavigation } from "react-router";

import {
  Page,
  Card,
  Modal,
  TextField,
  Select,
  InlineGrid,
  BlockStack,
  Badge,
  Button,
  IndexTable,
  Text,
  EmptyState,
  ColorPicker,
  hsbToHex,
  Banner,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { connectDB } from "../db.server";

const todayDate = () => new Date().toISOString().split("T")[0];

/* ---------------- LOADER ---------------- */
export const loader = async ({ request }) => {
  console.log("🔵 LOADER CALLED");
  const { session } = await authenticate.admin(request);

  await connectDB();
  const { default: Timer } = await import("../models/Timer");

  const timers = await Timer.findByShop(session.shop);
  console.log("📦 Timers loaded:", timers.length);

  return {
    shop: session.shop,
    timers: timers.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      description: t.description,
      startDate: t.startDate,
      startTime: t.startTime,
      endDate: t.endDate,
      endTime: t.endTime,
      status: t.status,
    })),
  };
};

/* ---------------- ACTION ---------------- */
export async function action({ request }) {
  console.log("\n🔥🔥🔥 ACTION CALLED 🔥🔥🔥\n");
  
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const intent = formData.get("intent");
  console.log("Intent:", intent);

  await connectDB();
  const { default: Timer } = await import("../models/Timer");

  if (intent === "create") {
    const timerData = {
      name: formData.get("name"),
      description: formData.get("description") || "",
      startDate: formData.get("startDate"),
      startTime: formData.get("startTime"),
      endDate: formData.get("endDate"),
      endTime: formData.get("endTime"),
      size: formData.get("size") || "medium",
      position: formData.get("position") || "top",
      urgency: formData.get("urgency") || "pulse",
      color: formData.get("color") || "#00ff00",
    };

    console.log("📦 Creating timer:", timerData);
    
    const doc = await Timer.createTimer(session.shop, timerData);
    console.log("✅ Timer saved:", doc._id);

    return { success: true, message: "Timer created!" };
  }

  if (intent === "delete") {
    const id = formData.get("timerId");
    console.log("🗑️ Deleting:", id);
    await Timer.deleteTimer(id);
    return { success: true, message: "Timer deleted!" };
  }

  return null;
}

/* ---------------- PAGE ---------------- */
export default function Index() {
  const { timers, shop } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const isSubmitting = navigation.state === "submitting";
  const showSuccess = actionData?.success;

  const filtered = timers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Page
      title="Countdown Timer Manager"
      subtitle={`Create and Manage countdown timers for your products`}
      primaryAction={{ 
        content: "Create timer", 
        onAction: () => setOpen(true),
        loading: isSubmitting 
      }}
    >
      <BlockStack gap="400">
        {showSuccess && (
          <Banner tone="success">
            {actionData.message}
          </Banner>
        )}

        <Card>
          <TextField
            placeholder="Search timers"
            value={search}
            onChange={setSearch}
            autoComplete="off"
          />
        </Card>

        {filtered.length === 0 ? (
          <Card>
            <EmptyState heading="No timers yet">
              <p>Create your first countdown timer</p>
            </EmptyState>
          </Card>
        ) : (
         <BlockStack gap="300">
  {filtered.map((t) => (
    <Card key={t.id}>
      <BlockStack gap="200">
        {/* Top row: name + menu */}
        <InlineGrid columns="1fr auto" alignItems="start">
          <Text as="h3" variant="headingSm" fontWeight="semibold">
            {t.name}
          </Text>

          {/* 3 dots = delete (same logic, same intent) */}
          <Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="timerId" value={t.id} />
            <Button
              variant="tertiary"
              size="slim"
              submit
              disabled={isSubmitting}
            >
              •••
            </Button>
          </Form>
        </InlineGrid>

        {/* Description */}
        {t.description && (
          <Text tone="subdued">{t.description}</Text>
        )}

        {/* Start / End */}
        <Text tone="subdued">
          <strong>Start:</strong> {t.startDate} {t.startTime}
          {"  •  "}
          <strong>End:</strong> {t.endDate} {t.endTime}
        </Text>
      </BlockStack>
    </Card>
  ))}
</BlockStack>

        )}
      </BlockStack>

      <CreateTimerModal 
        open={open} 
        onClose={() => setOpen(false)}
        isSubmitting={isSubmitting}
      />
    </Page>
  );
}

/* ---------------- MODAL ---------------- */
function CreateTimerModal({ open, onClose, isSubmitting }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    size: "medium",
    position: "top",
    urgency: "pulse",
    colorHSB: { hue: 120, saturation: 1, brightness: 1 },
  });

  const handleSave = () => {
    if (!form.name?.trim() || !form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      alert("Please fill all required fields");
      return;
    }

    // Submit the hidden form
    document.getElementById("createTimerForm").submit();
    
    // Reset and close
    setForm({
      name: "",
      description: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      size: "medium",
      position: "top",
      urgency: "pulse",
      colorHSB: { hue: 120, saturation: 1, brightness: 1 },
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Timer"
      primaryAction={{ 
        content: "Create timer", 
        onAction: handleSave,
        loading: isSubmitting 
      }}
      secondaryActions={[{ 
        content: "Cancel", 
        onAction: onClose,
        disabled: isSubmitting 
      }]}
    >
      <Modal.Section>
        <Form method="post" id="createTimerForm">
          <input type="hidden" name="intent" value="create" />
          <input type="hidden" name="name" value={form.name} />
          <input type="hidden" name="description" value={form.description} />
          <input type="hidden" name="startDate" value={form.startDate} />
          <input type="hidden" name="startTime" value={form.startTime} />
          <input type="hidden" name="endDate" value={form.endDate} />
          <input type="hidden" name="endTime" value={form.endTime} />
          <input type="hidden" name="size" value={form.size} />
          <input type="hidden" name="position" value={form.position} />
          <input type="hidden" name="urgency" value={form.urgency} />
          <input type="hidden" name="color" value={hsbToHex(form.colorHSB)} />
          
          <BlockStack gap="400">
            <TextField 
              label="Timer name" 
              value={form.name} 
              onChange={(v) => setForm({ ...form, name: v })} 
              requiredIndicator
              placeholder="e.g., Black Friday Sale"
            />

            <InlineGrid columns={2} gap="400">
              <TextField
                label="Start date"
                type="date"
                min={todayDate()}
                value={form.startDate}
                onChange={(v) => setForm({ ...form, startDate: v })}
                requiredIndicator
              />
              <TextField
                label="Start time"
                type="time"
                value={form.startTime}
                onChange={(v) => setForm({ ...form, startTime: v })}
                requiredIndicator
              />
            </InlineGrid>

            <InlineGrid columns={2} gap="400">
              <TextField
                label="End date"
                type="date"
                min={form.startDate || todayDate()}
                value={form.endDate}
                onChange={(v) => setForm({ ...form, endDate: v })}
                requiredIndicator
              />
              <TextField
                label="End time"
                type="time"
                value={form.endTime}
                onChange={(v) => setForm({ ...form, endTime: v })}
                requiredIndicator
              />
            </InlineGrid>

            <TextField
              label="Promotion description"
              multiline={3}
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              placeholder="e.g., 50% off all products"
            />

            <BlockStack gap="200">
              <Text variant="headingSm">Timer color</Text>
              <ColorPicker
                color={form.colorHSB}
                onChange={(color) => setForm({ ...form, colorHSB: color })}
              />
            </BlockStack>

            <InlineGrid columns={2} gap="400">
              <Select 
                label="Timer size" 
                options={[
                  { label: "Small", value: "small" },
                  { label: "Medium", value: "medium" },
                  { label: "Large", value: "large" },
                ]} 
                value={form.size} 
                onChange={(v) => setForm({ ...form, size: v })} 
              />

              <Select 
                label="Timer position" 
                options={[
                  { label: "Top", value: "top" },
                  { label: "Bottom", value: "bottom" },
                ]} 
                value={form.position} 
                onChange={(v) => setForm({ ...form, position: v })} 
              />
            </InlineGrid>

            <Select
              label="Urgency notification"
              options={[
                { label: "None", value: "none" },
                { label: "Color pulse", value: "pulse" },
                { label: "Blink", value: "blink" },
              ]}
              value={form.urgency}
              onChange={(v) => setForm({ ...form, urgency: v })}
            />
          </BlockStack>
        </Form>
      </Modal.Section>
    </Modal>
  );
}