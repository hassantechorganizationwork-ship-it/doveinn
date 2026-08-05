import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileDropzone } from "@/components/upload/FileDropzone";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => <img alt={props.alt} src={props.src} />,
}));

function makeFile(name: string, type: string, sizeBytes: number) {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
}

const ACCEPT = ["image/jpeg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024;

describe("FileDropzone", () => {
  it("renders the drop label when no file is selected", () => {
    render(
      <FileDropzone value={null} onChange={() => {}} accept={ACCEPT} maxSizeBytes={MAX_SIZE} />
    );
    expect(screen.getByText(/drag & drop an image/i)).toBeInTheDocument();
  });

  it("calls onChange with a valid file selected via the file picker", () => {
    const onChange = vi.fn();
    const { container } = render(
      <FileDropzone value={null} onChange={onChange} accept={ACCEPT} maxSizeBytes={MAX_SIZE} />
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile("photo.png", "image/png", 1024);
    fireEvent.change(input, { target: { files: [file] } });

    expect(onChange).toHaveBeenCalledWith(file);
  });

  it("calls onError instead of onChange for a disallowed file type", () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <FileDropzone
        value={null}
        onChange={onChange}
        onError={onError}
        accept={ACCEPT}
        maxSizeBytes={MAX_SIZE}
      />
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile("virus.exe", "application/x-msdownload", 1024);
    fireEvent.change(input, { target: { files: [file] } });

    expect(onChange).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/must be a jpeg/i));
  });

  it("calls onError for a file larger than the size limit", () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <FileDropzone
        value={null}
        onChange={onChange}
        onError={onError}
        accept={ACCEPT}
        maxSizeBytes={1024}
      />
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile("big.png", "image/png", 2048);
    fireEvent.change(input, { target: { files: [file] } });

    expect(onChange).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/smaller than/i));
  });

  it("shows the selected file's name and calls onChange(null) when removed", () => {
    const onChange = vi.fn();
    const file = makeFile("room-photo.jpg", "image/jpeg", 2048);

    render(
      <FileDropzone value={file} onChange={onChange} accept={ACCEPT} maxSizeBytes={MAX_SIZE} />
    );

    expect(screen.getByText("room-photo.jpg")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remove photo/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
