<!DOCTYPE html>
<html>
<head>
    <title>Laporan Nilai Ujian</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>REKAPITULASI HASIL UJIAN</h2>
        <h3>SMK NEGERI 1 BUKITTINGGI</h3>
        <p>Mata Ujian: <strong>{{ $exam->title }}</strong></p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Peserta</th>
                <th>Nilai Akhir</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($results as $index => $row)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $row->student_name }}</td>
                <td>{{ $row->score }}</td>
                <td>{{ $row->status }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top: 50px; text-align: right;">
        <p>Bukittinggi, {{ date('d M Y') }}</p>
        <br><br><br>
        <p><strong>Pengawas Ujian</strong></p>
    </div>
</body>
</html>