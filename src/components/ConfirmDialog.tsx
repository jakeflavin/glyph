import { useEffect, useRef } from 'react'
import { Button } from './controls.styled'
import { Actions, Dialog, Text } from './ConfirmDialog.styled'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * A native `<dialog>`, which brings focus trapping, focus restoration, an inert background
 * and the top layer without reimplementing any of them.
 *
 * It never closes itself: Escape is handled as `cancel` with its default prevented, and the
 * parent's state decides whether this is mounted. A dialog that closes itself leaves the
 * parent believing it is still open, and it can never be reopened.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal?.()
    if (!open && dialog.open) dialog.close?.()
  }, [open])

  return (
    <Dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        if (event.target === ref.current) onCancel()
      }}
    >
      <h2 id="confirm-title">{title}</h2>
      <Text>{body}</Text>
      <Actions>
        <Button type="button" onClick={onCancel}>
          Keep them
        </Button>
        <Button type="button" $danger onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Actions>
    </Dialog>
  )
}
