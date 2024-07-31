import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OutputView from './outputView';

// Mock the JsonView component
jest.mock('react-json-view-lite', () => ({
  JsonView: jest.fn(() => <div data-testid="json-view">Mocked JSON View</div>),
  darkStyles: {},
}));

describe('OutputView', () => {
  const mockOutput = Buffer.from('Hello, World!');

  it('renders raw output by default', () => {
    render(<OutputView output={mockOutput} />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('switches to JSON view when JSON data is provided', () => {
    const jsonOutput = Buffer.from(JSON.stringify({ key: 'value' }));
    render(<OutputView output={jsonOutput} />);
    
    const jsonButton = screen.getByText('JSON');
    fireEvent.click(jsonButton);

    expect(screen.getByTestId('json-view')).toBeInTheDocument();
  });

  it('switches to table view for CSV data', () => {
    const csvOutput = Buffer.from('header1,header2\nvalue1,value2');
    render(<OutputView output={csvOutput} />);
    
    const tableButton = screen.getByText('Table');
    fireEvent.click(tableButton);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('header1')).toBeInTheDocument();
    expect(screen.getByText('value1')).toBeInTheDocument();
  });

  it('handles TSV data correctly', () => {
    const tsvOutput = Buffer.from('header1\theader2\nvalue1\tvalue2');
    render(<OutputView output={tsvOutput} />);
    
    const tableButton = screen.getByText('Table');
    fireEvent.click(tableButton);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('header1')).toBeInTheDocument();
    expect(screen.getByText('value1')).toBeInTheDocument();
  });

  it('handles single column data correctly', () => {
    const singleColumnOutput = Buffer.from('header\nvalue1\nvalue2');
    render(<OutputView output={singleColumnOutput} />);
    
    const tableButton = screen.getByText('Table');
    fireEvent.click(tableButton);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('header')).toBeInTheDocument();
    expect(screen.getByText('value1')).toBeInTheDocument();
  });

  it('displays image for PNG data', () => {
    // Mock PNG signature
    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const pngOutput = Buffer.concat([pngSignature, Buffer.from('mock PNG data')]);
    
    render(<OutputView output={pngOutput} />);
    
    const imageButton = screen.getByText('Image');
    fireEvent.click(imageButton);

    const img = screen.getByAltText('PNG image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('data:image/png;base64,'));
  });

  it('handles empty output', () => {
    render(<OutputView output={Buffer.from('')} />);
    expect(screen.queryByText('Raw')).toBeInTheDocument();
  });

  it('handles invalid JSON gracefully', () => {
    const invalidJsonOutput = Buffer.from('{invalid json}');
    render(<OutputView output={invalidJsonOutput} />);
    expect(screen.queryByText('JSON')).not.toBeInTheDocument();
  });

  it('toggles between view modes correctly', () => {
    const jsonOutput = Buffer.from(JSON.stringify({ key: 'value' }));
    render(<OutputView output={jsonOutput} />);
    
    const rawButton = screen.getByText('Raw');
    const jsonButton = screen.getByText('JSON');

    fireEvent.click(jsonButton);
    expect(screen.getByTestId('json-view')).toBeInTheDocument();

    fireEvent.click(rawButton);
    expect(screen.getByText('{"key":"value"}')).toBeInTheDocument();
  });
});
